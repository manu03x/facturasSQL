const mysql  = require('mysql');
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'pweb'
});

let cliente={nombre:'Nepomuceno', RFC:'NEPO231010',ciudad:'Colima', email:'conocido@gmail.com', CP: '29100'};

let detallesFactura={productos:[{id:1,cantidad:30,costo:10},{id:2,cantidad:30,costo:20}]};

let factura = {fecha:'2023/03/23', total:150}



connection.connect();

connection.beginTransaction(function(err) {
  if (err) { throw err; }
  initializeTransaction();

});


function rollBack(err) {
  return connection.rollback(function() {
    throw err;
  });
}

function finalRollBack() {
  return connection.rollback(function() {
    console.log("Finalizado")
    connection.end()
  });
}

function initializeTransaction() {
  connection.query('INSERT INTO clientes SET ?', cliente, function (error, results) {
    if (error) {rollBack(error)}
    createBill(results.insertId)
  });
}

function createBill(clientId) {
  factura.cliente = clientId
  connection.query('INSERT INTO facturas SET ?', factura, function (error, results) {

    if (error) {rollBack(error)}

    detallesFactura.productos.forEach(product => {
        billDetails(product, results.insertId)
    })


      showProductos()


      finalRollBack()

  });
}

function billDetails(product, folio) {
  let buildJson = {

    factura: folio ,
    producto: product.id,
    cantidad: product.cantidad,
    costo: product.costo

    }


  connection.query('INSERT INTO detalleFacturas SET ?', buildJson, function (error, results, fields) {
    if (error) {rollBack(error)}
  });
}

function showProductos() {
  connection.query('SELECT * FROM productos', function (error, results, fields) {
    if (error) {rollBack(error)}
    console.log(results)
  });
}