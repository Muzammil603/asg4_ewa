from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from pymongo import MongoClient
from flask_cors import CORS
from datetime import datetime, timedelta
import uuid
import json
import random
from MongoDBDataStoreUtilities import mongo_bp
import mysql.connector
from bson import ObjectId


app = Flask(__name__)
CORS(app)


app.register_blueprint(mongo_bp)
# MySQL configurations
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://Muza:Muza@localhost/smarthomes'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


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
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    images = db.Column(db.Text)  # Store JSON as text in MySQL
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    category = db.relationship('Category', backref=db.backref('products', lazy=True))
    accessories = db.Column(db.Text)  # Store accessories as JSON text
    warranty_options = db.Column(db.Text)  # Store warranty options as JSON text

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
    users = ["John Doe", "Jane Smith", "Bob Johnson", "Alice Brown", "Charlie Davis"]
    products = Product.query.all()

    for _ in range(20):
        user = random.choice(users)
        order_items = random.sample(products, random.randint(1, 5))
        total_amount = sum(product.price for product in order_items)
        delivery_option = random.choice(["delivery", "pickup"])
        pickup_location = random.choice(store_locations).street if delivery_option == "pickup" else None

        order = Order(
            user_name=user,
            street=f"{random.randint(100, 999)} Sample St",
            city="Chicago",
            state="IL",
            zip_code=f"606{random.randint(10, 99)}",
            credit_card=f"**** **** **** {random.randint(1000, 9999)}",
            delivery_option=delivery_option,
            pickup_location=pickup_location,
            total_amount=total_amount,
            confirmation_number=f"ORD-{random.randint(100000, 999999)}",
            delivery_date=datetime.now().date() + timedelta(days=random.randint(1, 14)),
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

        # Add products to each category
        products = [
            # Smart Doorbells
            Product(name="Ring Video Doorbell", description="Smart doorbell with HD video and motion detection.",
                    price=199.99, images='', category_id=categories[0].id, accessories=json.dumps(sample_accessories[:2])),
            Product(name="Nest Hello", description="Wired doorbell with HD video and person alerts.",
                    price=229.99, images='', category_id=categories[0].id, accessories=json.dumps(sample_accessories)),
            Product(name="Arlo Video Doorbell", description="Smart doorbell with wide-angle view and HDR.",
                    price=149.99, images='', category_id=categories[0].id, accessories=json.dumps(sample_accessories)),
            Product(name="SimpliSafe Doorbell", description="Easy-to-install doorbell with video and audio.",
                    price=169.99, images='', category_id=categories[0].id, accessories=json.dumps(sample_accessories[:1])),
            Product(name="Eufy Security Doorbell", description="Battery-powered video doorbell with 2K resolution.",
                    price=179.99, images='', category_id=categories[0].id, accessories=json.dumps(sample_accessories[1:])),

            # Smart Doorlocks
            Product(name="August Smart Lock", description="Keyless entry and remote control for your door.",
                    price=229.99, images='', category_id=categories[1].id, accessories=json.dumps(sample_accessories[:2])),
            Product(name="Yale Assure Lock", description="Touchscreen smart lock with keyless entry.",
                    price=199.99, images='', category_id=categories[1].id, accessories=json.dumps(sample_accessories)),
            Product(name="Schlage Encode", description="Smart lock with built-in WiFi.",
                    price=249.99, images='', category_id=categories[1].id, accessories=json.dumps(sample_accessories)),
            Product(name="Ultraloq U-Bolt Pro", description="Smart lock with fingerprint ID.",
                    price=159.99, images='', category_id=categories[1].id, accessories=json.dumps(sample_accessories[:1])),
            Product(name="Kwikset SmartCode", description="Deadbolt smart lock with customizable entry codes.",
                    price=179.99, images='', category_id=categories[1].id, accessories=json.dumps(sample_accessories[1:])),

            # Smart Speakers
            Product(name="Amazon Echo", description="Voice-controlled smart speaker with Alexa.",
                    price=99.99, images='', category_id=categories[2].id, accessories=json.dumps(sample_accessories[:2])),
            Product(name="Google Nest Audio", description="Smart speaker with Google Assistant.",
                    price=89.99, images='', category_id=categories[2].id, accessories=json.dumps(sample_accessories)),
            Product(name="Apple HomePod Mini", description="Smart speaker with Siri integration.",
                    price=99.99, images='', category_id=categories[2].id, accessories=json.dumps(sample_accessories)),
            Product(name="Sonos One", description="Smart speaker with voice control and excellent sound.",
                    price=199.99, images='', category_id=categories[2].id, accessories=json.dumps(sample_accessories[:1])),
            Product(name="Bose Home Speaker 500", description="Smart speaker with Alexa and Google Assistant.",
                    price=299.99, images='', category_id=categories[2].id, accessories=json.dumps(sample_accessories[1:])),

            # Smart Lightings
            Product(name="Philips Hue Bulb", description="Smart light bulb with app control.",
                    price=49.99, images='', category_id=categories[3].id, accessories=json.dumps(sample_accessories[:2])),
            Product(name="LIFX Smart Bulb", description="Color-changing smart bulb.",
                    price=59.99, images='', category_id=categories[3].id, accessories=json.dumps(sample_accessories)),
            Product(name="Nanoleaf Light Panels", description="Customizable LED light panels.",
                    price=199.99, images='', category_id=categories[3].id, accessories=json.dumps(sample_accessories)),
            Product(name="Wyze Bulb", description="Affordable smart bulb with voice control.",
                    price=19.99, images='', category_id=categories[3].id, accessories=json.dumps(sample_accessories[:1])),
            Product(name="TP-Link Kasa Bulb", description="Smart bulb with adjustable brightness.",
                    price=29.99, images='', category_id=categories[3].id, accessories=json.dumps(sample_accessories[1:])),

            # Smart Thermostats
            Product(name="Nest Learning Thermostat", description="Smart thermostat that learns your preferences.",
                    price=249.99, images='', category_id=categories[4].id, accessories=json.dumps(sample_accessories[:2])),
            Product(name="Ecobee SmartThermostat", description="Thermostat with voice control and remote sensors.",
                    price=219.99, images='', category_id=categories[4].id, accessories=json.dumps(sample_accessories)),
            Product(name="Honeywell T9", description="Smart thermostat with room sensors.",
                    price=199.99, images='', category_id=categories[4].id, accessories=json.dumps(sample_accessories)),
            Product(name="Emerson Sensi", description="Smart thermostat with mobile app control.",
                    price=129.99, images='', category_id=categories[4].id, accessories=json.dumps(sample_accessories[:1])),
            Product(name="Lux Kono Smart Thermostat", description="Stylish thermostat with smart features.",
                    price=139.99, images='', category_id=categories[4].id, accessories=json.dumps(sample_accessories[1:]))
        ]

        db.session.add_all(products)
        db.session.commit()
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
            'accessories': json.loads(product.accessories) if product.accessories else []
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
            'warranty_options': ['No Warranty', '1 Year', '2 Years']
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



# New route to get order history for a user
# @app.route('/api/order-history/<string:user_name>', methods=['GET'])
# def get_order_history(user_name):
#     try:
#         orders = Order.query.filter_by(user_name=user_name).order_by(Order.order_date.desc()).all()
#         order_list = [
#             {
#                 'id': order.id,
#                 'confirmation_number': order.confirmation_number,
#                 'total_amount': order.total_amount,
#                 'order_date': order.order_date.strftime('%Y-%m-%d %H:%M:%S'),
#                 'delivery_date': order.delivery_date.strftime('%Y-%m-%d'),
#                 'delivery_option': order.delivery_option,
#                 'pickup_location': order.pickup_location
#             }
#             for order in orders
#         ]
#         return jsonify(order_list), 200
#     except Exception as e:
#         print(f"Error fetching order history: {e}")
#         return jsonify({'error': str(e)}), 500
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
    print("Received order data:", data)  # Debug print
    try:
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
        db.session.commit()
        return jsonify({'message': 'Order placed successfully', 'order_id': new_order.id}), 201
    except Exception as e:
        print(f"Error placing order: {str(e)}")  # Debug print
        db.session.rollback()
        return jsonify({'error': str(e)}), 500@app.route('/api/cart/clear', methods=['DELETE'])
def clear_cart():
    try:
        db.session.query(CartItem).delete()
        db.session.commit()
        return jsonify({'message': 'Cart cleared successfully'}), 200
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


# Endpoint to add a new product
@app.route('/api/products/add', methods=['POST'])
def add_product():
    data = request.json
    try:
        new_product = Product(
            id=str(uuid.uuid4()),
            name=data['name'],
            description=data['description'],
            price=data['price'],
            category_id=data['category'],
            accessories=json.dumps(data['accessories'])
        )
        db.session.add(new_product)
        db.session.commit()
        return jsonify({'message': 'Product added successfully', 'product': new_product.id}), 201
    except Exception as e:
        print(f"Error adding product: {e}")
        return jsonify({'error': str(e)}), 500

# Endpoint to update an existing product
@app.route('/api/products/update/<string:product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.json
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404

        product.name = data['name']
        product.description = data['description']
        product.price = data['price']
        product.category_id = data['category']
        product.accessories = json.dumps(data['accessories'])
        db.session.commit()
        return jsonify({'message': 'Product updated successfully'}), 200
    except Exception as e:
        print(f"Error updating product: {e}")
        return jsonify({'error': str(e)}), 500

# Endpoint to delete a product
@app.route('/api/products/delete/<string:product_id>', methods=['DELETE'])
def delete_product(product_id):
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404

        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': 'Product deleted successfully'}), 200
    except Exception as e:
        print(f"Error deleting product: {e}")
        return jsonify({'error': str(e)}), 500

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
    orders = Order.query.all()
    product_count = {}
    
    # Count the sold products
    for order in orders:
        order_items = json.loads(order.order_items)
        for item in order_items:
            product_id = item['id']
            if product_id in product_count:
                product_count[product_id] += 1
            else:
                product_count[product_id] = 1
    
    # Get the top 5 sold products
    top_sold_products = sorted(product_count.items(), key=lambda x: x[1], reverse=True)[:5]

    # Fetch product details using the product IDs
    product_ids = [product_id for product_id, count in top_sold_products]
    products = Product.query.filter(Product.id.in_(product_ids)).all()
    product_map = {product.id: product.name for product in products}
    
    # Create the response
    response = []
    for product_id, count in top_sold_products:
        product_name = product_map.get(product_id, "Unknown Product")
        response.append({
            "product_id": product_id,
            "product_name": product_name,
            "sold_count": count
        })
    print(response)
    return jsonify(response)


    
if __name__ == '__main__':
    app.run(debug=True, port=5001, threaded=True)
