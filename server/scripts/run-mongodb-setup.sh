#!/bin/bash

# Run the MongoDB setup script with the provided connection string
echo "Running MongoDB setup script with provided connection string..."
node setup-mongodb.mjs "mongodb+srv://admin:georgiatech@cluster0.k4tdfvm.mongodb.net/?retryWrites=true&w=majority"
