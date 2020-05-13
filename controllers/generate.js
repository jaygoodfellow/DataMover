module.exports = {
  index: async function(req, res) {
    const quantity = req.body.quantity || 75;

    const names = await DB.source.raw(
      `
      INSERT INTO Customer (FirstName, LastName, AcquisitionDate)
      SELECT first.firstName, last.lastName, (DATE(CURRENT_TIMESTAMP - INTERVAL FLOOR(RAND() * 7) DAY)) as AcquisitionDate
      FROM (SELECT ID as id, FirstName from customer) as first
      CROSS JOIN (SELECT  ID as id, LastName from customer) as last
			ORDER By RAND()
			LIMIT ${quantity}
      `
    );
    const rows = names[0].affectedRows;
    res.redirect(301, `/?quantity=${quantity}`);
  }
};
