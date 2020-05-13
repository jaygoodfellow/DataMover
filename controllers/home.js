const moment = require("moment");
module.exports = {
  index: async function(req, res) {
    const msg = req.query.quantity
      ? `Added ${req.query.quantity} customers`
      : null;
    const customers = await DB.source("Customer")
      .select(
        "Customer.ID",
        "Customer.FirstName",
        "Customer.LastName",
        "Customer.AcquisitionDate",
        "Export.ExportDate"
      )
      .leftJoin("Export", "Export.ID", "Customer.ExportID")
      .orderBy("AcquisitionDate", "desc")
      .then(results => {
        return results.map(result => {
          return {
            id: result.ID,
            first_name: result.FirstName,
            last_name: result.LastName,
            acquisition: moment(result.AcquisitionDate).format("YYYY-MM-DD"),
            export: result.ExportDate
              ? moment(result.ExportDate).format("YYYY-MM-DD")
              : null
          };
        });
      });
    res.render("index", { customers, msg });
  }
};
