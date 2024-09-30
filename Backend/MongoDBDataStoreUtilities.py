from pymongo import MongoClient
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import random
from bson import ObjectId
from bson import json_util

mongo_bp = Blueprint('mongo', __name__)

# MongoDB configurations
mongo_client = MongoClient('mongodb://localhost:27017/')
mongo_db = mongo_client['smarthomes']
reviews_collection = mongo_db['product_reviews']
flags_collection = mongo_db['flags']


def get_mongo_connection():
    return mongo_client
@mongo_bp.route('/api/trending/liked-products', methods=['GET'])
def get_top_liked_products():
    try:
        # Fetch top 5 liked products from MongoDB
        top_liked_products = list(reviews_collection.find().sort("ReviewRating", -1).limit(5))

        # Convert ObjectId to string for each product
        for product in top_liked_products:
            product['_id'] = str(product['_id'])  # Convert ObjectId to string
            # Convert any other potential ObjectId fields
            for key, value in product.items():
                if isinstance(value, ObjectId):
                    product[key] = str(value)

        return jsonify(top_liked_products), 200
    except Exception as e:
        print(f"Error fetching top liked products: {e}")
        return jsonify({"error": str(e)}), 500


@mongo_bp.route('/api/product-review', methods=['POST'])
def submit_product_review():
    data = request.json
    try:
        # Add timestamp to the review data
        data['timestamp'] = datetime.utcnow()
        # Insert the review data into MongoDB
        result = reviews_collection.insert_one(data)
        return jsonify({'message': 'Review submitted successfully', 'id': str(result.inserted_id)}), 201
    except Exception as e:
        print(f"Error saving review: {e}")
        return jsonify({'error': str(e)}), 500

@mongo_bp.route('/api/product-reviews', methods=['GET'])
def get_product_reviews():
    try:
        # Retrieve all reviews from MongoDB
        reviews = list(reviews_collection.find({}, {'_id': 0}))
        return jsonify(reviews), 200
    except Exception as e:
        print(f"Error fetching reviews: {e}")
        return jsonify({'error': str(e)}), 500

@mongo_bp.route('/api/product-reviews/<string:product_id>', methods=['GET'])
def get_product_reviews_by_id(product_id):
    try:
        # Retrieve reviews for a specific product
        reviews = list(reviews_collection.find({'ProductModelName': product_id}, {'_id': 0}))
        return jsonify(reviews), 200
    except Exception as e:
        print(f"Error fetching reviews for product {product_id}: {e}")
        return jsonify({'error': str(e)}), 500

def generate_sample_reviews():
    # Check if sample reviews have been generated before
    flag = flags_collection.find_one({'name': 'sample_reviews_generated'})
    if flag and flag.get('value', False):
        print("Sample reviews have already been generated. Skipping generation.")
        return

    review_texts = [
        "Great product! It works exactly as described.",
        "I'm very satisfied with this purchase. It has made my home much smarter.",
        "The installation was easy, and the product functions well.",
        "Good value for money. I would recommend it to others.",
        "It's okay, but I expected a bit more from it.",
        "Excellent addition to my smart home setup!",
        "The product quality is top-notch. Very impressed!",
        "It has some minor issues, but overall it's a good product.",
        "I love how it integrates with my other smart devices.",
        "The customer support was great when I had questions about setup.",
        "It's a bit pricey, but the features are worth it.",
        "This has simplified my daily routines significantly.",
        "The app could use some improvements, but the hardware is solid.",
        "I've had it for a month now and it's working flawlessly.",
        "It's not as user-friendly as I hoped, but it gets the job done.",
        "The energy savings have been noticeable since installation.",
        "I'm impressed with the build quality and design.",
        "It's a good start for making your home smarter.",
        "The voice control feature is my favorite part.",
        "It's been reliable so far, no complaints!"
    ]

    orders = [
        {"user_name": "Charlie Davis", "street": "563 Sample St", "city": "Chicago", "state": "IL", "zip_code": "60667", "products": ["Apple HomePod Mini", "Arlo Video Doorbell", "Yale Assure Lock", "LIFX Smart Bulb", "August Smart Lock"]},
        {"user_name": "John Doe", "street": "322 Sample St", "city": "Chicago", "state": "IL", "zip_code": "60612", "products": ["Eufy Security Doorbell"]},
        {"user_name": "Charlie Davis", "street": "711 Sample St", "city": "Chicago", "state": "IL", "zip_code": "60696", "products": ["Wyze Bulb", "LIFX Smart Bulb", "Arlo Video Doorbell"]},
        {"user_name": "Bob Johnson", "street": "997 Sample St", "city": "Chicago", "state": "IL", "zip_code": "60687", "products": ["Yale Assure Lock", "Honeywell T9", "Bose Home Speaker 500", "Ecobee SmartThermostat"]},
        {"user_name": "John Doe", "street": "172 Sample St", "city": "Chicago", "state": "IL", "zip_code": "60673", "products": ["TP-Link Kasa Bulb", "Google Nest Audio", "SimpliSafe Doorbell", "Ultraloq U-Bolt Pro", "Sonos One"]},
        {"user_name": "Jane Smith", "street": "333 Sample St", "city": "Chicago", "state": "IL", "zip_code": "60695", "products": ["Eufy Security Doorbell", "Bose Home Speaker 500", "TP-Link Kasa Bulb"]},
        {"user_name": "Bob Johnson", "street": "519 Sample St", "city": "Chicago", "state": "IL", "zip_code": "60658", "products": ["Google Nest Audio", "Yale Assure Lock", "August Smart Lock", "Bose Home Speaker 500"]},
        {"user_name": "Bob Johnson", "street": "693 Sample St", "city": "Chicago", "state": "IL", "zip_code": "60624", "products": ["SimpliSafe Doorbell", "Arlo Video Doorbell"]},
        {"user_name": "Bob Johnson", "street": "652 Sample St", "city": "Chicago", "state": "IL", "zip_code": "60649", "products": ["Emerson Sensi", "Sonos One", "Wyze Bulb"]},
        {"user_name": "Alice Brown", "street": "446 Sample St", "city": "Chicago", "state": "IL", "zip_code": "60635", "products": ["Yale Assure Lock", "Ecobee SmartThermostat", "LIFX Smart Bulb", "Philips Hue Bulb"]},
        {"user_name": "Alice Brown", "street": "676 Sample St", "city": "Chicago", "state": "IL", "zip_code": "60640", "products": ["Ecobee SmartThermostat", "Yale Assure Lock", "Bose Home Speaker 500", "Nanoleaf Light Panels", "Philips Hue Bulb"]},
        {"user_name": "Alice Brown", "street": "923 Sample St", "city": "Chicago", "state": "IL", "zip_code": "60666", "products": ["Nest Learning Thermostat", "Eufy Security Doorbell", "Nanoleaf Light Panels", "Arlo Video Doorbell", "Honeywell T9"]},
        {"user_name": "John Doe", "street": "916 Sample St", "city": "Chicago", "state": "IL", "zip_code": "60644", "products": ["Nest Learning Thermostat", "LIFX Smart Bulb"]},
        {"user_name": "Jane Smith", "street": "104 Sample St", "city": "Chicago", "state": "IL", "zip_code": "60626", "products": ["Google Nest Audio"]},
        {"user_name": "Bob Johnson", "street": "860 Sample St", "city": "Chicago", "state": "IL", "zip_code": "60624", "products": ["Ultraloq U-Bolt Pro", "Emerson Sensi", "Yale Assure Lock", "Google Nest Audio", "LIFX Smart Bulb"]},
        {"user_name": "John Doe", "street": "909 Sample St", "city": "Chicago", "state": "IL", "zip_code": "60686", "products": ["Nanoleaf Light Panels", "Arlo Video Doorbell", "Eufy Security Doorbell", "Philips Hue Bulb"]},
        {"user_name": "John Doe", "street": "431 Sample St", "city": "Chicago", "state": "IL", "zip_code": "60694", "products": ["Emerson Sensi", "Schlage Encode"]},
        {"user_name": "Jane Smith", "street": "805 Sample St", "city": "Chicago", "state": "IL", "zip_code": "60625", "products": ["Bose Home Speaker 500", "Ultraloq U-Bolt Pro", "Schlage Encode", "Arlo Video Doorbell"]},
        {"user_name": "John Doe", "street": "362 Sample St", "city": "Chicago", "state": "IL", "zip_code": "60619", "products": ["Apple HomePod Mini", "Nanoleaf Light Panels", "Nest Learning Thermostat"]},
        {"user_name": "Jane Smith", "street": "420 Sample St", "city": "Chicago", "state": "IL", "zip_code": "60638", "products": ["Ultraloq U-Bolt Pro", "Philips Hue Bulb", "LIFX Smart Bulb"]}
    ]

    def random_date():
        return datetime.now() - timedelta(days=random.randint(1, 30))

    reviews_to_insert = []
    for order in orders:
        for product in order['products']:
            review = {
                "ProductModelName": product,
                "ProductCategoryName": "Smart Home",  # You may want to map this more accurately
                "StoreID": "online",  # Assuming online purchase
                "StoreZip": order['zip_code'],
                "StoreCity": order['city'],
                "StoreState": order['state'],
                "ProductOnSale": random.choice(["Yes", "No"]),
                "ManufacturerName": product.split()[0],  # Using the first word of product name as manufacturer
                "ManufacturerRebate": random.choice(["Yes", "No"]),
                "UserID": order['user_name'].replace(" ", "").lower(),  # Creating a simple user ID
                "UserAge": random.randint(18, 75),
                "UserGender": random.choice(["Male", "Female", "Other"]),
                "UserOccupation": random.choice(["Engineer", "Teacher", "Doctor", "Student", "Retired", "Business Owner"]),
                "ReviewRating": random.randint(3, 5),  # Assuming mostly positive reviews
                "ReviewDate": random_date(),
                "ReviewText": random.choice(review_texts),
                "DeliveryType": "pickup" if "pickup" in order else "delivery"
            }
            reviews_to_insert.append(review)

    if reviews_to_insert:
        reviews_collection.insert_many(reviews_to_insert)
        print(f"Added {len(reviews_to_insert)} sample reviews to the database.")
        
        # Set the flag to indicate that sample reviews have been generated
        flags_collection.update_one(
            {'name': 'sample_reviews_generated'},
            {'$set': {'value': True}},
            upsert=True
        )
    else:
        print("No sample reviews to add.")



# Generate sample reviews when this module is imported
generate_sample_reviews()