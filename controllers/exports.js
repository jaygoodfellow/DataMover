const moment = require("moment");
module.exports = {
  index: async function(req, res) {
    const msg = req.query.quantity
      ? `Added ${req.query.quantity} customers`
      : null;
    const exportCount = await DB.source("Customer")
      .whereNull("ExportID")
      .count("ID as total")
      .first()
      .then(result => result.total);
    const exports = await DB.source
      .raw(
        `
      select Export.ID, Export.ExportDate, count(Log.ID) as records, count(Log.ErrorID) as Errors, Export.Complete
      from Export
      left join Log on Log.ExportId = Export.ID
      group by Export.ID
      order by ExportDate desc
      `
      )
      .then(results => {
        return results[0].map(result => {
          return {
            id: result.ID,
            date: moment(result.ExportDate).format("YYYY-MM-DD"),
            status: result.Complete ? "Complete" : "Pending",
            errors: result.Errors,
            records: result.records
          };
        });
      });
    res.render("exports", { exports, exportCount, msg });
  },
  list: async function(req, res) {
    const id = req.params.id || null;
    if (!id) {
      res.redirect("/");
      return;
    }

    const ex = await DB.source("Export")
      .where("ID", id)
      .first();
    const customers = await DB.source("Log")
      .select(
        "Customer.FirstName",
        "Customer.LastName",
        "Customer.AcquisitionDate",
        "Error.ID as Code",
        "Error.Message"
      )
      .leftJoin("Customer", "Customer.ID", "Log.CustomerID")
      .leftJoin("Error", "Error.ID", "Log.ErrorID")
      .where("Log.ExportID", id)
      .orderBy("ErrorID", "desc")
      .orderBy("AcquisitionDate", "desc")
      .then(results => {
        return results.map(result => {
          return {
            customer: `${result.FirstName} ${result.LastName}`,
            acquisition: moment(result.AcquisitionDate).format("YYYY-MM-DD"),
            error: result.Code ? `${result.Code} - ${result.Message}` : ""
          };
        });
      });
    const exportDate = moment(ex.ExportDate).format("YYYY-MM-DD");
    res.render("export", { customers, exportDate });
  },
  export: async function(req, res) {
    const msg = null;
    const newExport = await DB.source("Export").insert({
      ExportDate: moment().format("YYYY-MM-DD")
    });

    await DB.source("Customer")
      .update({ ExportID: newExport[0] })
      .whereNull("ExportID");
    res.redirect("/exports");
  }
};
