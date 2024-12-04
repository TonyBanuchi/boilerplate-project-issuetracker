'use strict';
const { MongoClient, ObjectId } = require('mongodb');

module.exports = function (app) {

  //DB setup
  const mdbClient = new MongoClient(process.env.MONGO_URI);
  const dbName = 'fcc-backend';

  let dbCollection;

  const connectMongoDatabase = async () => {
    await mdbClient.connect();
    console.log('Connected successfully to server');
    const db = mdbClient.db(dbName);
    dbCollection = db.collection('issues');

    return;
  }
  connectMongoDatabase().then(
    () => {
      console.log('DB Connection Established');
    }
  ).catch(
    e => {
      console.error(e);
    }
  );
  app.route('/api/issues/:project')

    .get(async (req, res) => {
      let project = req.params.project;
      const filter = { project };
      let result;

      const qKeys = Object.keys(req.query);
      if (qKeys) {
        qKeys.forEach((qk) => {
          if (qk !== 'vscodeBrowserReqId') {
            filter[qk] = req.query[qk];
          }
        });
      }
      const searchCursor = dbCollection.find(filter);
      result = [];
      for await (const item of searchCursor) {
        result.push(item);
      }
      res.json(result);
      return;
    })

    .post(
      async (req, res) => {
        let project = req.params.project;
        let result;
        const {
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text
        } = req.body;

        if (issue_title && issue_text && created_by) {
          const issueObj = {
            project: project,
            issue_title,
            issue_text,
            created_by,
            assigned_to,
            status_text,
            open: true,
            created_on: new Date(),
            updated_on: new Date()
          };
          await dbCollection.insertOne(issueObj).then(
            async (newItem) => {
              await dbCollection.findOne({ _id: newItem.insertedId }).then((item) => {
                const {
                  assigned_to,
                  status_text,
                  open,
                  _id,
                  issue_title,
                  issue_text,
                  created_by,
                  created_on,
                  updated_on
                } = item;
                result = {
                  assigned_to,
                  status_text,
                  open,
                  _id,
                  issue_title,
                  issue_text,
                  created_by,
                  created_on,
                  updated_on
                };
              }).catch((rejected) => {
                result = { error: 'Unable to locate newly created record' };
              });
            }
          ).catch(
            (error) => {
              result = { error: `New Item Creation Error: ${error}` };
            }
          );
        } else {
          result = { error: "missing required fields" };
        }

        res.json(result);
        return;
      }
    )

    .put(async (req, res) => {
      try {
        let project = req.params.project;
        let result;
        const { _id } = req.body;
        // invalid id or missing id
        if (!_id || _id.length === 0){
          result = { "error": "could not update, no _id provided" };
        } else if (_id.length !== 24) {
            result = { "error": "could not update", "_id": _id };
        } else {
          const objectId = new ObjectId(_id);
          const updateContent = {};
          const bodyKeys = Object.keys(req.body);
          for (const ui of bodyKeys) {
            if (ui !== '_id' && req.body[ui]) {
              if (ui === 'open') {
                updateContent.open = false;
              } else {
                updateContent[ui] = req.body[ui];
              }
            }
          }

          updateContent.updated_on = new Date();

          await dbCollection.findOneAndUpdate({ _id: objectId }, {$set: updateContent}, { includeResultMetadata: true }).then(
            (modResult) => {
              if (modResult.ok) {
                result = { "result": "successfully updated", "_id": _id }
              } else {
                result = { "error": "could not update", "_id": _id };
              }
            }
          ).catch(
            (err) => {
              result = { "error": `could not update internal error: ${err}`, "_id": _id };
            }
          );
        }
        res.json(result);
        return;
      } catch (e) {
        console.error(e);
        res.sendStatus(500);
        return;
      }
    })

    .delete(async (req, res) => {
      try {
        let project = req.params.project;
        let result;
        const _id = req.body._id;
        // invalid id or missing id
        if (!_id || _id.length === 0){
          result = { "error": "could not delete, no _id provided" };
        } else if (_id.length !== 24) {
          result = { "error": "could not delete", "_id": _id };
        } else {
          const objectId = new ObjectId(_id);

          await dbCollection.findOneAndDelete({ _id: objectId }, { includeResultMetadata: true }).then(
            (modResult) => {
              if (modResult.ok) {
                result = { "result": "successfully deleted", "_id": _id }
              } else {
                result = { "error": "could not delete", "_id": _id };
              }
            }).catch((err) => {
              result = { "error": `could not delete, internal error: ${err}`, "_id": req.body._id }
            });
        }
        res.json(result);
        return;
      } catch (e) {
        console.error(e);
        res.sendStatus(500);
        return;
      }
    });

};
