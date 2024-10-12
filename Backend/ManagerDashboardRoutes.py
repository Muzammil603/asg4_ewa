from flask import Blueprint, jsonify
from sqlalchemy import func
from datetime import datetime, timedelta
from database import db, Product, Order, CartItem, OrderItem

manager_bp = Blueprint('manager', __name__)

@manager_bp.route('/api/inventory', methods=['GET'])
def get_inventory():
    try:
        inventory = db.session.query(
            Product.name,
            Product.price,
            func.count(CartItem.id).label('quantity')
        ).outerjoin(CartItem).group_by(Product.id).all()

        inventory_data = [
            {
                'name': item.name,
                'price': float(item.price),
                'quantity': item.quantity
            } for item in inventory
        ]

        return jsonify(inventory_data), 200
    except Exception as e:
        print(f"Error fetching inventory: {e}")
        return jsonify({'error': str(e)}), 500

@manager_bp.route('/api/sales', methods=['GET'])
def get_sales():
    try:
        sales = db.session.query(
            Product.name,
            Product.price,
            func.sum(OrderItem.quantity).label('quantity_sold'),
            func.sum(OrderItem.price_at_purchase * OrderItem.quantity).label('total_sales')
        ).join(OrderItem).group_by(Product.id).all()

        sales_data = [
            {
                'name': item.name,
                'price': float(item.price),
                'quantity_sold': int(item.quantity_sold or 0),
                'total_sales': float(item.total_sales or 0)
            } for item in sales
        ]

        return jsonify(sales_data), 200
    except Exception as e:
        print(f"Error fetching sales: {e}")
        return jsonify({'error': str(e)}), 500

@manager_bp.route('/api/sale-products', methods=['GET'])
def get_sale_products():
    try:
        sale_products = Product.query.filter(Product.sale_price.isnot(None)).all()

        sale_products_data = [
            {
                'name': product.name,
                'original_price': float(product.price),
                'sale_price': float(product.sale_price)
            } for product in sale_products
        ]

        return jsonify(sale_products_data), 200
    except Exception as e:
        print(f"Error fetching sale products: {e}")
        return jsonify({'error': str(e)}), 500

@manager_bp.route('/api/rebate-products', methods=['GET'])
def get_rebate_products():
    try:
        rebate_products = Product.query.filter(Product.rebate_amount.isnot(None)).all()

        rebate_products_data = [
            {
                'name': product.name,
                'price': float(product.price),
                'rebate_amount': float(product.rebate_amount)
            } for product in rebate_products
        ]

        return jsonify(rebate_products_data), 200
    except Exception as e:
        print(f"Error fetching rebate products: {e}")
        return jsonify({'error': str(e)}), 500

@manager_bp.route('/api/daily-sales', methods=['GET'])
def get_daily_sales():
    try:
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=30)

        daily_sales = db.session.query(
            func.date(Order.order_date).label('date'),
            func.sum(Order.total_amount).label('total_sales')
        ).filter(
            Order.order_date.between(start_date, end_date)
        ).group_by(
            func.date(Order.order_date)
        ).order_by(
            func.date(Order.order_date)
        ).all()

        daily_sales_data = [
            {
                'date': item.date.strftime('%Y-%m-%d'),
                'total_sales': float(item.total_sales)
            } for item in daily_sales
        ]

        return jsonify(daily_sales_data), 200
    except Exception as e:
        print(f"Error fetching daily sales: {e}")
        return jsonify({'error': str(e)}), 500

# Additional route for total product count
@manager_bp.route('/api/product-count', methods=['GET'])
def get_product_count():
    try:
        product_count = Product.query.count()
        return jsonify({'product_count': product_count}), 200
    except Exception as e:
        print(f"Error fetching product count: {e}")
        return jsonify({'error': str(e)}), 500

# Additional route for top selling products
@manager_bp.route('/api/top-selling-products', methods=['GET'])
def get_top_selling_products():
    try:
        top_products = db.session.query(
            Product.name,
            func.sum(OrderItem.quantity).label('total_sold')
        ).join(OrderItem).group_by(Product.id).order_by(func.sum(OrderItem.quantity).desc()).limit(5).all()

        top_products_data = [
            {
                'name': item.name,
                'total_sold': int(item.total_sold)
            } for item in top_products
        ]

        return jsonify(top_products_data), 200
    except Exception as e:
        print(f"Error fetching top selling products: {e}")
        return jsonify({'error': str(e)}), 500

# Additional route for revenue by category
@manager_bp.route('/api/revenue-by-category', methods=['GET'])
def get_revenue_by_category():
    try:
        revenue_by_category = db.session.query(
            Category.name.label('category_name'),
            func.sum(OrderItem.price_at_purchase * OrderItem.quantity).label('total_revenue')
        ).join(Product, Product.id == OrderItem.product_id
        ).join(Category, Category.id == Product.category_id
        ).group_by(Category.name).all()

        category_revenue_data = [
            {
                'category': item.category_name,
                'revenue': float(item.total_revenue)
            } for item in revenue_by_category
        ]

        return jsonify(category_revenue_data), 200
    except Exception as e:
        print(f"Error fetching revenue by category: {e}")
        return jsonify({'error': str(e)}), 500