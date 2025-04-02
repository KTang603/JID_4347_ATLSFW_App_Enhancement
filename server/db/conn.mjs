import { MongoClient } from "mongodb";
import getMongoPasscode from "../password.mjs";

// Old connection string
// const uri = "mongodb+srv://" + getMongoPasscode() + "@cluster0.buqut.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// New connection string
const uri = "mongodb+srv://" + getMongoPasscode() + "@cluster0.k4tdfvm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

class DatabaseConnection {
    constructor() {
        this.client = new MongoClient(uri, {
            maxPoolSize: 10,
            minPoolSize: 5,
            retryWrites: true,
            w: 'majority'
        });
        this.isConnected = false;
        this.posts_db = null;
        this.users_db = null;
        this.news_db = null;
        this.events_db = null;
        this.saved_articles_db = null;
        this.third_party_db = null;


    }

    async connect() {
        if (this.isConnected) {
            return {third_party_db:this.third_party_db,saved_articles_db: this.saved_articles_db, posts_db: this.posts_db, users_db: this.users_db, news_db: this.news_db,events_db: this.events_db };
        }

        try {
            console.log('Connecting to MongoDB...');
            await this.client.connect();
            console.log('Successfully connected to MongoDB');

            this.posts_db = this.client.db("posts");
            this.saved_articles_db = this.client.db("saved_articles");
            this.users_db = this.client.db("users");
            this.news_db = this.client.db("news");
            this.events_db = this.client.db("events");
            this.third_party_db = this.client.db("third_party");

            this.isConnected = true;

            // Test the connection
            const result = await this.users_db.command({ ping: 1 });
            console.log("MongoDB connection test result:", result);

            // Setup connection monitoring
            this.client.on('close', () => {
                console.log('MongoDB connection closed');
                this.isConnected = false;
            });

            this.client.on('error', (error) => {
                console.error('MongoDB connection error:', error);
                this.isConnected = false;
            });

            // Setup automatic reconnection
            this.client.on('timeout', async () => {
                console.log('MongoDB connection timeout, attempting to reconnect...');
                this.isConnected = false;
                await this.connect();
            });

            return {third_party_db: this.third_party_db,saved_articles_db: this.saved_articles_db ,posts_db: this.posts_db, users_db: this.users_db, news_db: this.news_db,events_db: this.events_db };
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            this.isConnected = false;
            throw error;
        }
    }

    async checkConnection() {
        if (!this.isConnected) {
            try {
                await this.connect();
            } catch (error) {
                console.error('Failed to reconnect to MongoDB:', error);
                return false;
            }
        }

        try {
            await this.users_db.command({ ping: 1 });
            return true;
        } catch (error) {
            console.error('MongoDB connection check failed:', error);
            this.isConnected = false;
            return false;
        }
    }
}

// Create a singleton instance
const dbConnection = new DatabaseConnection();

// Initialize connection
const {third_party_db,saved_articles_db ,posts_db, users_db, news_db,events_db } = await dbConnection.connect();

// Export database instances and connection checker
export {third_party_db,saved_articles_db, posts_db, users_db, news_db,events_db };
export const checkConnection = () => dbConnection.checkConnection();
