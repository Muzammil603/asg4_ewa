from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text, func
from pymongo import MongoClient
from flask_cors import CORS
from datetime import datetime, timedelta
import uuid
import json
import random
from MongoDBDataStoreUtilities import mongo_bp
import mysql.connector
from bson import ObjectId
import xml.etree.ElementTree as ET
import logging


app = Flask(__name__)
CORS(app)


app.register_blueprint(mongo_bp)
# MySQL configurations
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://Muza:Muza@localhost/smarthomes'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Initialize HashMap (Dictionary in Python)
products_map = {}
# Define the Category model

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    street = db.Column(db.String(120), nullable=False)
    city = db.Column(db.String(80), nullable=False)
    state = db.Column(db.String(50), nullable=False)
    zip_code = db.Column(db.String(20), nullable=False)
    role = db.Column(db.String(20), default='customer')

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

# Define the Product model
class Product(db.Model):
    __tablename__ = 'product'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    images = db.Column(db.Text)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    category = db.relationship('Category', backref=db.backref('products', lazy=True))
    accessories = db.Column(db.Text)
    warranty_options = db.Column(db.Text)
    retailer_discount = db.Column(db.Float, default=0.0)
    manufacturer_rebate = db.Column(db.Float, default=0.0)
    available_items = db.Column(db.Integer, default=0)  # New field for inventory
    

    
    
    from sqlalchemy import Index

    __table_args__ = (
        Index('ix_product_name', 'name'),  # Create an index on the name field
    )

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'retailer_discount': self.retailer_discount,
            'manufacturer_rebate': self.manufacturer_rebate,
            'category_id': self.category_id,
            'category_name': self.category.name,
            'accessories': json.loads(self.accessories) if self.accessories else [],
            'warranty_options': json.loads(self.warranty_options) if self.warranty_options else [],
            'available_items': self.available_items
            
        }

# Define the CartItem model
class CartItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.String(36), db.ForeignKey('product.id'), nullable=False)
    product = db.relationship('Product', backref=db.backref('cart_items', lazy=True))
    accessories = db.Column(db.Text)  # Store accessories as JSON text
    warranty = db.Column(db.String(50))  # Warranty type
    quantity = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'product_id': self.product_id,
            'quantity': self.quantity,
            'accessories': self.accessories,
            'warranty': self.warranty,
            'total_price': self.total_price
        }
# In app.py (or the backend file where the models are defined)
class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(80), nullable=False)
    street = db.Column(db.String(120), nullable=False)
    city = db.Column(db.String(80), nullable=False)
    state = db.Column(db.String(50), nullable=False)
    zip_code = db.Column(db.String(20), nullable=False)
    credit_card = db.Column(db.String(20), nullable=False)
    delivery_option = db.Column(db.String(20), nullable=False)
    pickup_location = db.Column(db.String(120))
    total_amount = db.Column(db.Float, nullable=False)
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    confirmation_number = db.Column(db.String(20), unique=True, nullable=False)
    delivery_date = db.Column(db.Date, nullable=False)
    order_items = db.Column(db.Text, nullable=False)  # Store as JSON
    status = db.Column(db.String(20), default='Pending')  # New status field


class StoreLocation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    street = db.Column(db.String(120), nullable=False)
    city = db.Column(db.String(80), nullable=False)
    state = db.Column(db.String(50), nullable=False)
    zip_code = db.Column(db.String(20), nullable=False)


def create_sample_data():
    # Create sample store locations
    store_locations = [
        StoreLocation(street="123 Main St", city="Chicago", state="IL", zip_code="60601"),
        StoreLocation(street="456 Oak Ave", city="Chicago", state="IL", zip_code="60602"),
        StoreLocation(street="789 Pine Rd", city="Chicago", state="IL", zip_code="60603"),
        StoreLocation(street="321 Elm St", city="Chicago", state="IL", zip_code="60604"),
        StoreLocation(street="654 Maple Dr", city="Chicago", state="IL", zip_code="60605"),
        StoreLocation(street="987 Cedar Ln", city="Chicago", state="IL", zip_code="60606"),
        StoreLocation(street="147 Birch Blvd", city="Chicago", state="IL", zip_code="60607"),
        StoreLocation(street="258 Spruce St", city="Chicago", state="IL", zip_code="60608"),
        StoreLocation(street="369 Willow Way", city="Chicago", state="IL", zip_code="60609"),
        StoreLocation(street="159 Oakwood Ave", city="Chicago", state="IL", zip_code="60610"),
    ]
    db.session.add_all(store_locations)
    db.session.commit()

    # Create sample orders
    users = [
    "John Doe", "Jane Smith", "Bob Johnson", "Alice Brown", "Charlie Davis",
    "David Wilson", "Ella Thompson", "Frank Garcia", "Grace Lee", "Hank Martinez",
    "Isabella Moore", "Jack White", "Karen King", "Leo Scott", "Megan Adams",
    "Nancy Baker", "Oscar Carter", "Paula Evans", "Quincy Foster", "Rachel Green"
    ]

    # Cities and states to choose from
    
    locations = [
    {"city": "Chicago", "state": "IL", "zip_code": "60601"},
    {"city": "New York", "state": "NY", "zip_code": "10001"},
    {"city": "Los Angeles", "state": "CA", "zip_code": "90001"},
    {"city": "Houston", "state": "TX", "zip_code": "77001"},
    {"city": "Phoenix", "state": "AZ", "zip_code": "85001"},
    {"city": "Philadelphia", "state": "PA", "zip_code": "19101"},
    {"city": "San Antonio", "state": "TX", "zip_code": "78201"},
    {"city": "San Diego", "state": "CA", "zip_code": "92101"},
    {"city": "Dallas", "state": "TX", "zip_code": "75201"},
    {"city": "Austin", "state": "TX", "zip_code": "73301"},
]
    products = Product.query.all()

    credit_card_number = ''.join([str(random.randint(0, 9)) for _ in range(16)])
    # random_base_date = datetime.now().date() + timedelta(days=random.randint(-15, 15))

    for _ in range(100):
        user = random.choice(users)
        order_items = random.sample(products, random.randint(1, 5))
        total_amount = sum(product.price for product in order_items)
        delivery_option = random.choice(["delivery", "pickup"])
        pickup_location = random.choice(store_locations).street if delivery_option == "pickup" else None
        random_base_date = datetime.now().date() + timedelta(days=random.randint(-15, 0))
        order = Order(
            user_name=user,
            street=f"{random.randint(100, 999)} Sample St",
            city=random.choice(locations)["city"],
            state=random.choice(locations)["state"],
            zip_code=random.choice(locations)["zip_code"],
            credit_card=credit_card_number,
            delivery_option=delivery_option,
            pickup_location=pickup_location,
            total_amount=total_amount,
            confirmation_number=f"ORD-{random.randint(100000, 999999)}",
            order_date=random_base_date,
            delivery_date = random_base_date + timedelta(days=14),
            order_items=json.dumps([{"id": item.id, "name": item.name, "price": item.price} for item in order_items])
        )
        db.session.add(order)

    db.session.commit()

# Create tables if they don't exist and populate initial data
with app.app_context():
    #Use a connection to execute raw SQL commands
    with db.engine.connect() as connection:
        # Disable foreign key checks
        connection.execute(text('SET FOREIGN_KEY_CHECKS = 0;'))

        # Drop the tables that have foreign key constraints first
        connection.execute(text('DROP TABLE IF EXISTS warranty;'))
        connection.execute(text('DROP TABLE IF EXISTS accessory;'))

        # Now, drop all tables
        db.drop_all()

        # Create tables again
        db.create_all()

        # Re-enable foreign key checks
        connection.execute(text('SET FOREIGN_KEY_CHECKS = 1;'))
    
    # Product management functions
def read_products_from_xml(file_path):
    tree = ET.parse(file_path)
    root = tree.getroot()
    
    for product_elem in root.findall('.//product'):
        product_id = str(uuid.uuid4())
        name = product_elem.find('name').text
        price = float(product_elem.find('price').text)
        description = product_elem.find('description').text
        category_name = product_elem.find('category').text
        
        accessories = []
        for accessory in product_elem.findall('.//accessory'):
            accessory_id = str(uuid.uuid4())
            accessory_name = accessory.find('name').text
            accessory_price = float(accessory.find('price').text)
            accessories.append({
                'id': accessory_id,
                'name': accessory_name,
                'price': accessory_price
            })
        
        warranty_options = [option.text for option in product_elem.findall('.//warranty')]
        retailer_discount = float(product_elem.find('retailer_discount').text)
        manufacturer_rebate = float(product_elem.find('manufacturer_rebate').text)
        available_items = int(product_elem.find('available_items').text)
        
        products_map[product_id] = {
            'id': product_id,
            'name': name,
            'price': price,
            'description': description,
            'category': category_name,
            'accessories': accessories,
            'warranty_options': warranty_options,
            'retailer_discount': retailer_discount,
            'manufacturer_rebate': manufacturer_rebate,
            'available_items': available_items
        }

def store_products_in_database():
    for product_id, product_data in products_map.items():
        category = Category.query.filter_by(name=product_data['category']).first()
        if not category:
            category = Category(name=product_data['category'])
            db.session.add(category)
            db.session.commit()
        
        new_product = Product(
            id=product_id,
            name=product_data['name'],
            description=product_data['description'],
            price=product_data['price'],
            category_id=category.id,
            accessories=json.dumps(product_data['accessories']),
            warranty_options=json.dumps(product_data['warranty_options']),
            retailer_discount=product_data['retailer_discount'],
            manufacturer_rebate=product_data['manufacturer_rebate'],
            available_items=product_data['available_items']
        )
        db.session.add(new_product)
    
    db.session.commit()

def initialize_product_data(xml_file_path):
    read_products_from_xml(xml_file_path)
    store_products_in_database()


    # Check if the categories table is empty
    if not Category.query.first():
        # Add product categories
        categories = [
            Category(name="Smart Doorbells"),
            Category(name="Smart Doorlocks"),
            Category(name="Smart Speakers"),
            Category(name="Smart Lightings"),
            Category(name="Smart Thermostats")
        ]
        db.session.add_all(categories)
        db.session.commit()

        # Sample accessories
        sample_accessories = [
            {'id': str(uuid.uuid4()), 'name': 'Battery Pack', 'price': 19.99},
            {'id': str(uuid.uuid4()), 'name': 'Wall Mount', 'price': 29.99},
            {'id': str(uuid.uuid4()), 'name': 'Smart Plug', 'price': 14.99}
        ]

       
        # Helper function to generate random rebate or discount
    def random_discount_or_rebate():
    # Randomly return a rebate, discount, both, or neither
        rebate = round(random.uniform(2, 15), 2) if random.choice([True, False]) else 0
        discount = round(random.uniform(2, 15), 2) if random.choice([True, False]) else 0
        return rebate, discount
    
    create_sample_data()
    if not User.query.first():
        sample_users = [
            User(name="John Doe", email="john@example.com", password="password123", street="123 Main St", city="Chicago", state="IL", zip_code="60601", role="customer"),
            User(name="Jane Smith", email="jane@example.com", password="password123", street="456 Oak Ave", city="Chicago", state="IL", zip_code="60602", role="customer"),
            User(name="Bob Johnson", email="bob@example.com", password="password123", street="789 Pine Rd", city="Chicago", state="IL", zip_code="60603", role="customer"),
            User(name="Alice Brown", email="alice@example.com", password="password123", street="321 Elm St", city="Chicago", state="IL", zip_code="60604", role="customer"),
            User(name="Charlie Davis", email="charlie@example.com", password="password123", street="654 Maple Dr", city="Chicago", state="IL", zip_code="60605", role="customer"),
            User(name="David Wilson", email="david@example.com", password="password123", street="987 Cedar Ln", city="Chicago", state="IL", zip_code="60606", role="customer"),
            User(name="Ella Thompson", email="ella@example.com", password="password123", street="147 Birch Blvd", city="Chicago", state="IL", zip_code="60607", role="customer"),
            User(name="Frank Garcia", email="frank@example.com", password="password123", street="258 Spruce St", city="Chicago", state="IL", zip_code="60608", role="customer"),
            User(name="Grace Lee", email="grace@example.com", password="password123", street="369 Willow Way", city="Chicago", state="IL", zip_code="60609", role="customer"),
            User(name="Hank Martinez", email="hank@example.com", password="password123", street="159 Oakwood Ave", city="Chicago", state="IL", zip_code="60610", role="customer"),
            User(name="Isabella Moore", email="isabella@example.com", password="password123", street="741 Cypress St", city="Chicago", state="IL", zip_code="60611", role="customer"),
            User(name="Jack White", email="jack@example.com", password="password123", street="852 Pinecone Ln", city="Chicago", state="IL", zip_code="60612", role="customer"),
            User(name="Karen King", email="karen@example.com", password="password123", street="963 Maplewood Dr", city="Chicago", state="IL", zip_code="60613", role="customer"),
            User(name="Leo Scott", email="leo@example.com", password="password123", street="174 Redwood Ave", city="Chicago", state="IL", zip_code="60614", role="customer"),
            User(name="Megan Adams", email="megan@example.com", password="password123", street="285 Pinehurst Dr", city="Chicago", state="IL", zip_code="60615", role="customer"),
            User(name="Nancy Baker", email="nancy@example.com", password="password123", street="396 Oak Ln", city="Chicago", state="IL", zip_code="60616", role="customer"),
            User(name="Oscar Carter", email="oscar@example.com", password="password123", street="507 Birchwood Rd", city="Chicago", state="IL", zip_code="60617", role="customer"),
            User(name="Paula Evans", email="paula@example.com", password="password123", street="618 Willow Cir", city="Chicago", state="IL", zip_code="60618", role="customer"),
            User(name="Quincy Foster", email="quincy@example.com", password="password123", street="729 Oakview St", city="Chicago", state="IL", zip_code="60619", role="customer"),
            User(name="Rachel Green", email="rachel@example.com", password="password123", street="840 Maple Dr", city="Chicago", state="IL", zip_code="60620", role="customer")
        ]
        db.session.add_all(sample_users)
        db.session.commit()




# Endpoint to fetch all products
@app.route('/api/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    product_list = [
        {
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'price': product.price,
            'images': product.images,
            'category_id': product.category_id,
            'category_name': product.category.name,
            'accessories': json.loads(product.accessories) if product.accessories else [],
            'manufacturer_rebate': product.manufacturer_rebate,
            'retailer_discount': product.retailer_discount,
            'available_items': product.available_items
            
            
            
        }
        for product in products
    ]
    return jsonify(product_list), 200

@app.route('/api/products/<string:product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.query.filter_by(id=product_id).first()
    if product:
        product_data = {
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'price': product.price,
            'images': product.images,
            'category_id': product.category_id,
            'accessories': json.loads(product.accessories) if product.accessories else [],
            'warranty_options': ['No Warranty', '1 Year', '2 Years'],
            'manufacturer_rebate': product.manufacturer_rebate,
            'retailer_discount': product.retailer_discount,
            'available_items': product.available_items
            
        }
        return jsonify(product_data), 200
    else:
        return jsonify({'error': 'Product not found'}), 404
    
# Endpoint to fetch all cart items
@app.route('/api/cart', methods=['GET'])
def get_cart_items():
    cart_items = CartItem.query.all()
    cart_list = [
        {
            'id': item.id,
            'product_id': item.product_id,
            'product_name': item.product.name,  # Include product name
            'quantity': item.quantity,
            'accessories': json.loads(item.accessories) if item.accessories else [],
            'warranty': item.warranty,
            'total_price': item.total_price  # Add total_price to the response
        }
        for item in cart_items
    ]
    return jsonify(cart_list), 200

# Endpoint to add an item to the cart
@app.route('/api/cart/add', methods=['POST'])
def add_to_cart():
    data = request.json
    try:
        # Check if the 'total_price' is in the incoming data and is not None
        if 'total_price' not in data or data['total_price'] is None:
            return jsonify({'error': 'Total price cannot be null.'}), 400
        
        # Check if 'product_id', 'quantity', and 'warranty' are provided
        if 'product_id' not in data or 'quantity' not in data or 'warranty' not in data:
            return jsonify({'error': 'Product ID, quantity, and warranty are required.'}), 400

        # Create a new CartItem instance
        new_item = CartItem(
            product_id=data['product_id'],
            quantity=data['quantity'],
            accessories=json.dumps(data['accessories']),  # Convert accessories to JSON string
            warranty=data['warranty'],
            total_price=data['total_price']
        )

        # Add the new item to the database
        db.session.add(new_item)
        db.session.commit()

        return jsonify(new_item.to_dict()), 201

    except Exception as e:
        # Log the error for debugging
        print(f"Error: {e}")
        # Return a JSON response with error details
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/cart/remove/<int:item_id>', methods=['DELETE'])
def remove_from_cart(item_id):
    try:
        item = CartItem.query.get(item_id)
        print("looking for item", item_id)
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        db.session.delete(item)
        db.session.commit()
        return jsonify({'message': 'Item removed from cart'}), 200
    except Exception as e:
        print(f"Error removing from cart: {e}")  # Add debugging info
        return jsonify({'error': str(e)}), 500


# Endpoint to update quantity of a cart item
@app.route('/api/cart/update/<int:item_id>', methods=['PUT'])
def update_cart_item(item_id):
    data = request.json
    try:
        item = CartItem.query.get(item_id)
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        item.quantity = data['quantity']
        db.session.commit()
        return jsonify({'message': 'Item quantity updated'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/productsget', methods=['GET'])
def get_products_get():
    products = Product.query.all()
    product_list = [
        {
            'id': product.id,
            'name': product.name,
            'category': product.category.name,
            'price': product.price,
            'manufacturer': product.manufacturer_name  # Assuming you have this field in your Product model
        }
        for product in products
    ]
    return jsonify(product_list), 200


@app.route('/api/store-locations', methods=['GET'])
def get_store_locations():
    locations = StoreLocation.query.all()
    return jsonify([
        {
            "id": loc.id,
            "street": loc.street,
            "city": loc.city,
            "state": loc.state,
            "zip_code": loc.zip_code
        } for loc in locations
    ]), 200

@app.route('/api/place-order', methods=['POST'])
def place_order():
    data = request.json
    print("Received order data:", data)
    try:
        # Start a transaction
        db.session.begin()

        new_order = Order(
            user_name=data['name'],
            street=data['street'],
            city=data['city'],
            state=data['state'],
            zip_code=data['zipCode'],
            credit_card=data['creditCard'],
            delivery_option=data['deliveryOption'],
            pickup_location=data.get('pickupLocation'),
            total_amount=data['totalAmount'],
            confirmation_number=data['confirmationNumber'],
            delivery_date=datetime.strptime(data['deliveryDate'], '%a %b %d %Y'),
            order_items=json.dumps(data['cartItems'])
        )
        db.session.add(new_order)

        # Update product inventory and sales
        for item in data['cartItems']:
            product = Product.query.get(item['product_id'])
            if product:
                if product.available_items < item['quantity']:
                    db.session.rollback()
                    return jsonify({'error': f'Not enough inventory for {product.name}'}), 400
                product.available_items -= item['quantity']
                

        db.session.commit()
        return jsonify({'message': 'Order placed successfully', 'order_id': new_order.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/api/cart/clear', methods=['DELETE'])
def clear_cart():
    try:
        db.session.query(CartItem).delete()
        db.session.commit()
        return jsonify({'message': 'Cart cleared successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def update_product_catalog_xml(product_data, operation='add'):
    try:
        tree = ET.parse('ProductCatalog.xml')
        root = tree.getroot()

        if operation == 'delete':
            for product in root.findall('product'):
                if product.find('id').text == product_data['id'] or product.find('name').text == product_data['name']:
                    root.remove(product)
                    break
        elif operation == 'update':
            updated = False
            for product in root.findall('product'):
                if product.find('id').text == product_data['id'] or product.find('name').text == product_data['name']:
                    for key, value in product_data.items():
                        if key == 'accessories':
                            accessories = product.find('accessories')
                            accessories.clear()
                            for accessory in value:
                                acc_elem = ET.SubElement(accessories, 'accessory')
                                ET.SubElement(acc_elem, 'name').text = str(accessory['name'])
                                ET.SubElement(acc_elem, 'price').text = str(accessory['price'])
                        else:
                            elem = product.find(key)
                            if elem is None:
                                elem = ET.SubElement(product, key)
                            elem.text = str(value)
                    updated = True
                    break
            if not updated:
                operation = 'add'  # If product not found, add it as new

        if operation == 'add':
            product_elem = ET.SubElement(root, 'product')
            for key, value in product_data.items():
                if key == 'accessories':
                    accessories = ET.SubElement(product_elem, 'accessories')
                    for accessory in value:
                        acc_elem = ET.SubElement(accessories, 'accessory')
                        ET.SubElement(acc_elem, 'name').text = str(accessory['name'])
                        ET.SubElement(acc_elem, 'price').text = str(accessory['price'])
                else:
                    ET.SubElement(product_elem, key).text = str(value)

        tree.write('ProductCatalog.xml', encoding='utf-8', xml_declaration=True)
        print(f"XML catalog updated successfully for operation: {operation}")
    except Exception as e:
        print(f"Error updating XML catalog: {e}")
        raise

@app.route('/api/products/add', methods=['POST'])
def add_product():
    data = request.json
    try:
        category = Category.query.filter_by(name=data['category']).first()
        if not category:
            category = Category(name=data['category'])
            db.session.add(category)
            db.session.commit()

        # Handle numeric fields
        price = float(data.get('price', 0))
        retailer_discount = float(data.get('retailer_discount', 0))
        manufacturer_rebate = float(data.get('manufacturer_rebate', 0))
        available_items = int(data.get('available_items', 0))

        new_product = Product(
            id=str(uuid.uuid4()),
            name=data['name'],
            description=data['description'],
            price=price,
            category_id=category.id,
            accessories=json.dumps(data.get('accessories', [])),
            warranty_options=json.dumps(data.get('warranty_options', [])),
            retailer_discount=retailer_discount,
            manufacturer_rebate=manufacturer_rebate,
            available_items=available_items
        )
        db.session.add(new_product)
        db.session.commit()

        # Update the XML file
        product_data = {
            'id': new_product.id,
            'name': new_product.name,
            'description': new_product.description,
            'price': new_product.price,
            'category': category.name,
            'accessories': json.loads(new_product.accessories),
            'warranty_options': json.loads(new_product.warranty_options),
            'retailer_discount': new_product.retailer_discount,
            'manufacturer_rebate': new_product.manufacturer_rebate,
            'available_items': new_product.available_items
        }
        update_product_catalog_xml(product_data, 'add')

        return jsonify({'message': 'Product added successfully', 'product_id': new_product.id}), 201
    except Exception as e:
        print(f"Error adding product: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/update/<string:product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.json
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404

        # Update product in database
        product.name = data['name']
        product.description = data['description']
        product.price = float(data['price'])
        product.category_id = data['category']
        product.accessories = json.dumps(data.get('accessories', []))
        product.warranty_options = json.dumps(data.get('warranty_options', []))
        product.retailer_discount = float(data.get('retailer_discount', 0.0))
        product.manufacturer_rebate = float(data.get('manufacturer_rebate', 0.0))
        product.available_items = int(data.get('available_items', 0))

        db.session.commit()

        # Update XML
        xml_data = data.copy()
        xml_data['id'] = product_id  # Ensure we're using the database ID
        update_product_catalog_xml(xml_data, 'update')

        return jsonify({'message': 'Product updated successfully'}), 200
    except Exception as e:
        print(f"Error updating product: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/delete/<string:product_id>', methods=['DELETE'])
def delete_product(product_id):
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404

        product_name = product.name  # Get the name before deleting

        db.session.delete(product)
        db.session.commit()

        # Update XML
        update_product_catalog_xml({'id': product_id, 'name': product_name}, 'delete')

        return jsonify({'message': 'Product deleted successfully'}), 200
    except Exception as e:
        print(f"Error deleting product: {e}")
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/products/search', methods=['GET'])
def search_products():
    query = request.args.get('query', '')
    if query:
        products = Product.query.filter(Product.name.ilike(f'%{query}%')).limit(10).all()  # Limit results to 10
        return jsonify([product.to_dict() for product in products])
    return jsonify([]), 400



@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.json
    try:
        # Check if email already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400

        # Create a new User instance
        new_user = User(
            name=data['name'],
            email=data['email'],
            password=data['password'],  # In production, use hashed passwords!
            street=data['street'],
            city=data['city'],
            state=data['state'],
            zip_code=data['zipCode'],
            role=data.get('role', 'customer')
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User registered successfully', 'user_id': new_user.id}), 201
    except Exception as e:
        print(f"Error registering user: {e}")
        return jsonify({'error': str(e)}), 500

# Endpoint to login a user
@app.route('/api/login', methods=['POST'])
def login_user():
    data = request.json
    try:
        user = User.query.filter_by(email=data['email'], password=data['password']).first()
        if user:
            return jsonify({'message': 'Login successful', 'user_id': user.id, 'name': user.name, 'role': user.role}), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 400
    except Exception as e:
        print(f"Error during login: {e}")
        return jsonify({'error': str(e)}), 500

# Endpoint to get user info
@app.route('/api/user/<string:user_id>', methods=['GET'])
def get_user_info(user_id):
    try:
        user = User.query.get(user_id)
        if user:
            user_data = {
                'name': user.name,
                'email': user.email,
                'street': user.street,
                'city': user.city,
                'state': user.state,
                'zip_code': user.zip_code,
                'role': user.role
            }
            return jsonify(user_data), 200
        else:
            return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        print(f"Error fetching user info: {e}")
        return jsonify({'error': str(e)}), 500
@app.route('/api/customers', methods=['GET'])
def get_all_customers():
    try:
        customers = User.query.filter_by(role='customer').all()
        customer_list = [
            {
                'id': customer.id,
                'name': customer.name,
                'email': customer.email,
                'street': customer.street,
                'city': customer.city,
                'state': customer.state,
                'zip_code': customer.zip_code
            }
            for customer in customers
        ]
        return jsonify(customer_list), 200
    except Exception as e:
        print(f"Error fetching customers: {e}")
        return jsonify({'error': str(e)}), 500

# Endpoint to update a customer
@app.route('/api/user/update/<string:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        user.name = data['name']
        user.email = data['email']
        user.street = data['street']
        user.city = data['city']
        user.state = data['state']
        user.zip_code = data['zipCode']
        if data['password']:  # Update password only if provided
            user.password = data['password']
        db.session.commit()
        return jsonify({'message': 'User updated successfully'}), 200
    except Exception as e:
        print(f"Error updating user: {e}")
        return jsonify({'error': str(e)}), 500

# Endpoint to delete a customer
@app.route('/api/user/delete/<string:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        print(f"Error deleting user: {e}")
        return jsonify({'error': str(e)}), 500
# Endpoint to fetch all orders
@app.route('/api/orders', methods=['GET'])
def get_orders():
    try:
        orders = Order.query.all()
        order_list = [
            {
                'id': order.id,
                'name': order.user_name,
                'street': order.street,
                'city': order.city,
                'state': order.state,
                'zip_code': order.zip_code,
                'credit_card': order.credit_card,
                'items': json.loads(order.order_items),
                'total_amount': order.total_amount,
                'confirmation_number': order.confirmation_number,
                'order_date': order.order_date.strftime('%Y-%m-%d %H:%M:%S'),
                'delivery_date': order.delivery_date.strftime('%Y-%m-%d'),
                'delivery_option': order.delivery_option,
                'pickup_location': order.pickup_location
            }
            for order in orders
        ]
        return jsonify(order_list), 200
    except Exception as e:
        print(f"Error fetching orders: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders/add', methods=['POST'])
def add_order():
    data = request.json
    try:
        # Create a new order with data received from the frontend
        new_order = Order(
            user_name=data['user_name'],  # Match field names from frontend
            street=data['street'],
            city=data['city'],
            state=data['state'],
            zip_code=data['zip_code'],  # Use consistent naming
            credit_card=data['credit_card'],
            delivery_option=data['delivery_option'],
            pickup_location=data.get('pickup_location'),  # Optional field
            order_items=json.dumps(data['order_items']),  # Convert to JSON string
            total_amount=float(data['total_amount']),  # Ensure it's stored as a float
            order_date=datetime.strptime(data['order_date'], '%Y-%m-%d'),  # Convert to datetime
            confirmation_number=f"ORD-{random.randint(100000, 999999)}",
            delivery_date=datetime.strptime(data['delivery_date'], '%Y-%m-%d')  # Convert to date
        )
        db.session.add(new_order)
        db.session.commit()
        return jsonify({'message': 'Order added successfully', 'order_id': new_order.id}), 201
    except Exception as e:
        print(f"Error adding order: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/orders/update/<int:order_id>', methods=['PUT'])
def update_order(order_id):
    data = request.json
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        # Update the order fields with data received from the frontend
        order.user_name = data['user_name']
        order.street = data['street']
        order.city = data['city']
        order.state = data['state']
        order.zip_code = data['zip_code']  # Use consistent naming
        order.credit_card = data['credit_card']
        order.delivery_option = data['delivery_option']
        order.pickup_location = data.get('pickup_location')
        order.total_amount = float(data['total_amount'])
        order.order_date = datetime.strptime(data['order_date'], '%Y-%m-%d')
        order.delivery_date = datetime.strptime(data['delivery_date'], '%Y-%m-%d')
        order.confirmation_number = data['confirmation_number']
        order.order_items = json.dumps(data['order_items'])  # Convert to JSON string

        db.session.commit()
        return jsonify({'message': 'Order updated successfully'}), 200
    except Exception as e:
        print(f"Error updating order: {e}")
        return jsonify({'error': str(e)}), 500

# Endpoint to delete an order
@app.route('/api/orders/delete/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        db.session.delete(order)
        db.session.commit()
        return jsonify({'message': 'Order deleted successfully'}), 200
    except Exception as e:
        print(f"Error deleting order: {e}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/orderhistory/<string:user_name>', methods=['GET'])
def get_order_history(user_name):
    try:
        orders = Order.query.filter_by(user_name=user_name).order_by(Order.order_date.desc()).all()
        order_list = [
            {
                'id': order.id,
                'confirmation_number': order.confirmation_number,
                'name': order.user_name,
                'street': order.street,
                'city': order.city,
                'state': order.state,
                'zip_code': order.zip_code,
                'delivery_date': order.delivery_date.strftime('%Y-%m-%d'),
                'status': order.status  # Ensure status is included here
            }
            for order in orders
        ]
        return jsonify(order_list), 200
    except Exception as e:
        print(f"Error fetching order history: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/orders/cancel/<string:confirmation_number>', methods=['PUT'])
def cancel_order(confirmation_number):
    try:
        order = Order.query.filter_by(confirmation_number=confirmation_number).first()
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        order.status = 'Cancelled'  # Update the status to 'Cancelled'
        db.session.commit()
        return jsonify({'message': 'Order cancelled successfully'}), 200
    except Exception as e:
        print(f"Error cancelling order: {e}")
        return jsonify({'error': str(e)}), 500
# Route to get top five most liked products
# def get_top_liked_products():
#     try:
#         # Assuming you are fetching the top 5 liked products from MongoDB
#         top_liked_products = list(reviews_collection.find().sort("ReviewRating", -1).limit(5))
        
#         # Convert ObjectId to string for each product in the list
#         for product in top_liked_products:
#             if '_id' in product:
#                 product['_id'] = str(product['_id'])
        
#         return jsonify(top_liked_products)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# Route to get top five zip codes with most sales
@app.route('/api/trending/zip-codes', methods=['GET'])
def get_top_zip_codes():
    result = db.session.query(
        Order.zip_code,
        db.func.count(Order.id).label('sales_count')
    ).group_by(Order.zip_code).order_by(db.desc('sales_count')).limit(5).all()
    
    return jsonify([{"zip_code": zip_code, "sales_count": sales_count} for zip_code, sales_count in result])

# Route to get top five most sold products
@app.route('/api/trending/sold-products', methods=['GET'])
def get_top_sold_products():
    try:
        # Query to get product sales data, ordered by sold items
        sales_data = db.session.query(
            Product.id,
            Product.name,
            func.sum(func.JSON_LENGTH(Order.order_items)).label('sold_items')
        ).join(
            Order,
            text("JSON_CONTAINS(Order.order_items, CONCAT('{\"id\":\"', Product.id, '\"}'), '$')")
        ).group_by(
            Product.id
        ).order_by(
            func.sum(func.JSON_LENGTH(Order.order_items)).desc()
        ).limit(5).all()

        # Convert the result to a list of dictionaries
        result = [
            {
                'product_id': item.id,
                'product_name': item.name,
                'sold_count': int(item.sold_items or 0)
            } for item in sales_data
        ]

        return jsonify(result)
    except Exception as e:
        error_message = f"Error fetching top sold products: {str(e)}"
        print(error_message)
        return jsonify({'error': error_message}), 500
    
@app.route('/api/sales', methods=['GET'])
def get_sales_data():
    try:
        # Query to get product sales data
        sales_data = db.session.query(
            Product.id,
            Product.name,
            Product.price,
            func.sum(func.JSON_LENGTH(Order.order_items)).label('sold_items'),
            func.sum(Product.price * func.JSON_LENGTH(Order.order_items)).label('total_sales')
        ).join(
            Order,
            text("JSON_CONTAINS(Order.order_items, CONCAT('{\"id\":\"', Product.id, '\"}'), '$')")
        ).group_by(
            Product.id
        ).all()

        # Convert the result to a list of dictionaries
        result = [
            {
                'id': item.id,
                'name': item.name,
                'price': float(item.price),
                'sold_items': int(item.sold_items or 0),
                'total_sales': float(item.total_sales or 0)
            } for item in sales_data
        ]

        return jsonify(result)
    except Exception as e:
        error_message = f"Error fetching sales data: {str(e)}"
        print(error_message)
        return jsonify({'error': error_message}), 500

@app.route('/api/daily-sales', methods=['GET'])
def get_daily_sales():
    try:
        print("Entering get_daily_sales function")
        
        # Calculate date range
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=29)
        
        print(f"Fetching sales data from {start_date} to {end_date}")

        # Query to get daily sales for the last 30 days
        daily_sales = db.session.query(
            func.date(Order.order_date).label('date'),
            func.sum(Order.total_amount).label('total_sales')
        ).filter(
            func.date(Order.order_date).between(start_date, end_date)
        ).group_by(
            func.date(Order.order_date)
        ).order_by(
            func.date(Order.order_date)
        ).all()

        print(f"Number of days with sales: {len(daily_sales)}")

        # Convert to list of dictionaries
        result = [
            {
                'date': date.strftime('%Y-%m-%d'),
                'total_sales': float(total_sales)
            } for date, total_sales in daily_sales
        ]

        print(f"Result: {result}")

        return jsonify(result)
    except Exception as e:
        error_message = f"Error in get_daily_sales: {str(e)}"
        print(error_message)
        import traceback
        print(traceback.format_exc())
        return jsonify({'error': error_message}), 500
    
if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)
    with app.app_context():
        db.create_all()
        initialize_product_data('ProductCatalog.xml')
    app.run(debug=True, port=5001, threaded=True)
