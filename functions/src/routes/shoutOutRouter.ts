import { ObjectId } from "bson";
import express from "express";
import { getClient } from "../db";
import ShoutOut from "../models/ShoutOut";

const shoutOutRouter = express.Router();

const errorResponse = (error: any, res: any) => {
  console.error("FAIL", error);
  res.status(500).json({ message: "Internal Server Error" });
};

shoutOutRouter.get("/", async (req, res) => {
  try {
    const client = await getClient();
    const results = await client
      .db()
      .collection<ShoutOut>("shoutouts")
      .find()
      .toArray();
    res.json(results);
  } catch (err) {
    errorResponse(err, res);
  }
});

shoutOutRouter.get("/user/:name", async (req, res) => {
  try {
    const name: string = req.params.name;
    const client = await getClient();
    const results = await client
      .db()
      .collection<ShoutOut>("shoutouts")
      .find({ to: name })
      .toArray();
    res.json(results);
  } catch (err) {
    errorResponse(err, res);
  }
});

shoutOutRouter.get("/top-five", async (req, res) => {
  try {
    const client = await getClient();
    const results = await client
      .db()
      .collection<ShoutOut>("shoutouts")
      .aggregate([
        { $group: { _id: "$to", totalShoutOuts: { $sum: 1 } } },
        { $sort: { totalShoutOuts: -1 } },
        { $limit: 5 },
        { $project: { name: "$_id" } },
      ])
      .toArray();
    res.json(results);
  } catch (error) {
    errorResponse(error, res);
  }
});

shoutOutRouter.post("/", async (req, res) => {
  try {
    const newShoutOut: ShoutOut = req.body;
    const client = await getClient();
    await client.db().collection<ShoutOut>("shoutouts").insertOne(newShoutOut);
    res.status(201).json(newShoutOut);
  } catch (error) {
    errorResponse(error, res);
  }
});

shoutOutRouter.delete("/:id", async (req, res) => {
  try {
    const id: string = req.params.id;
    const client = await getClient();
    const result = await client
      .db()
      .collection<ShoutOut>("shoutouts")
      .deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount) {
      res.sendStatus(204);
    } else {
      res.status(404).send("Not Found");
    }
  } catch (error) {
    errorResponse(error, res);
  }
});

export default shoutOutRouter;
