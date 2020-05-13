const moment = require("moment");
module.exports = {
  index: async function(req, res) {
    const ex = await DB.source("Export")
      .whereNull("Complete")
      .orderBy("ExportDate", "asc")
      .first();

    if (!ex) {
      res.status(200).json({ id: null, errors: 0, records: 0 });
      return;
    }
    const exportID = ex.ID;

    const records = await DB.source("Customer")
      .where("ExportID", exportID)
      .then(results => {
        return results.map(result => {
          return {
            ExternalID: result.ID,
            FirstName: result.FirstName,
            LastName: result.LastName,
            DateAdded: ex.ExportDate
          };
        });
      });
    var errors = 0;
    const destIDs = [];
    const logs = [];
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      var errorID = null;
      try {
        const newID = await DB.destination("Customer").insert(record);
        destIDs.push(newID[0]);
      } catch (error) {
        errors++;
        errorID = 20112;
      }
      logs.push({
        ExportID: exportID,
        CustomerID: record.ExternalID,
        errorID: errorID
      });
    }
    if (errors > 0) {
      await DB.destination("Customer")
        .delete()
        .whereIn("ID", destIDs);

      await DB.source("Customer")
        .update({ ExportID: DB.source.raw("DEFAULT") })
        .where("ExportID", exportID);
    }

    await DB.source("Log").insert(logs);
    await DB.source("Export")
      .update({ Complete: 1 })
      .where("ID", exportID);

    res.status(200).json({ errors: errors, records: records.length });
  }
};
