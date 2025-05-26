const connectDB = require("./db");
const { ObjectId } = require("mongodb");

exports.handler = async (event) => {
  const method = event.httpMethod;
  const id = event.path.split("/").pop();

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const collection = await connectDB();

    if (method === "OPTIONS") {
      return { statusCode: 200, headers };
    }

    if (method === "GET" && id !== "items") {
      const task = await collection.findOne({ _id: new ObjectId(id) });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(task),
      };
    }

    if (method === "GET") {
      const tasks = await collection.find({}).toArray();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(tasks),
      };
    }

    if (method === "POST") {
      const data = JSON.parse(event.body);
      const result = await collection.insertOne(data);
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ id: result.insertedId }),
      };
    }

    if (method === "PUT") {
      const data = JSON.parse(event.body);
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: data }
      );
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Updated" }),
      };
    }

    if (method === "DELETE") {
      await collection.deleteOne({ _id: new ObjectId(id) });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Deleted" }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
