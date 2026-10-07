from database import engine, Base
import models


print("Connecting to PostgreSQL...")

Base.metadata.create_all(bind=engine)

print("Database tables created successfully!")