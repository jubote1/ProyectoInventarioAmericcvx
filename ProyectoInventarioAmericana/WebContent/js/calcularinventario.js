	

var server;
var tiendas;
var urlTienda ="";
var inventarios;
var bandera = false;
var dataTableDespacho;


// Se arma el valor de la variable global server, con base en la cual se realiza llamado a los servicios.
$(document).ready(function() {

	//Obtenemos el valor de la variable server
	var loc = window.location;
	var pathName = loc.pathname.substring(0, loc.pathname.lastIndexOf('/') + 1);
	server = loc.href.substring(0, loc.href.length - ((loc.pathname + loc.search + loc.hash).length - pathName.length));
	

    

	} );

//Se obtiene el listado de tiendas con el fin de seleccionar la tienda a surtir.

$(function(){

	getListaTiendas();
	
	
});

$('body').keyup(function(e) {
	if(e.keyCode==38)//38 para arriba
      mover(e,-1);
    if(e.keyCode==40)//40 para abajo
      mover(e,1);
 });


function mover(event, to) {
   let list = $('input');
   let index = list.index($(event.target));
   index = (index + to) % list.length;
   list.eq(index).focus();
}



//Método que invoca el servicio para obet
function getListaTiendas(){
	$.getJSON(server + 'GetTiendas', function(data){
		tiendas = data;
		var str = '';
		for(var i = 0; i < data.length;i++){
			var cadaTienda  = data[i];
			str +='<option value="'+ cadaTienda.nombre +'" id ="'+ cadaTienda.id +'">' + cadaTienda.nombre +'</option>';
		}
		$('#selectTiendas').html(str);
	});
}



//Método principal invocado para validar los datos de los parámetros y adicionalmente ejecutar los servicios para 
//recuperar la informacion y pintarla en pantalla.
function calcularInventario() 
{

	var fechasurtir = $("#fechasurtir").val();
	var tienda = $("#selectTiendas").val();
	var idtienda = $("#selectTiendas option:selected").attr('id');
	
	if(fechasurtir == '' || fechasurtir == null)
	{
		alert ('La fecha de Surtir debe ser diferente a vacía');
		return;
	}

	
	if(existeFecha(fechasurtir))
	{
	}
	else
	{
		alert ('La fecha a surtir no es correcta');
		return;
	}

	
	if (tienda == '' || tienda == null)
	{

		alert ('La tienda no puede estar vacía');
		return;
	}
	// Si pasa a este punto es porque paso las validaciones
	
	$.ajax({ 
	    		url: server + 'CalcularInventarioTienda?fechasurtir=' + fechasurtir + "&idtienda=" + idtienda, 
	    		dataType: 'json', 
	    		async: false, 
	    		success: function(data1){ 
	    				inventarios = data1;
	    				bandera = true;
	    				var inventario;
						
						var strInv='';
						
						strInv += '<table id="inventariosurtir" class="table table-bordered">';
						strInv += '<thead><tr><th COLSPAN="2"><img src="LogoAmericana.png" class="img-circle" /></th>';
						strInv += '<th COLSPAN="4"> <h2>'+ "PRODUCTOS A LLEVAR TIENDA " + tienda + " " + fechasurtir +'</h2></th></tr>'
						strInv += '<tr><th>Nom/Insumo</th><th>Cant/Req</th><th>Cant/Tienda</th><th>Cantidad a Surtir</th><th>Empaque</th><th>Unidad Medida</th></tr></thead>';
				        strInv += '<tbody>';
						for (var i = 0; i < inventarios.length; i++)
						{
							inventario = inventarios[i];
							strInv +='<tr> ';
							strInv +='<td> ';
							strInv +='<label>' + inventario.nombreinsumo + '</label> </td>';
							strInv +='<td> ';
							strInv +='<label>' + inventario.requerido + '</label> </td>';
							strInv +='<td> ';
							strInv +='<label>' + inventario.cantidadtienda + '</label> </td>';
							strInv +='<td> ';
							strInv += '<input type="text" name="' + inventario.cantidadcanastas + '"" value="' + inventario.cantidadllevar +'" id="'+ "cant" + inventario.idinsumo +'" maxlength="10" size="10" onchange="modificarContenedor(this)"> </td>';
							if(inventario.cantidadcanastas > 0)
							{
								strInv +='<td><input type="text" value="' + inventario.cantidadcanastas + inventario.nombrecontenedor +'" id="'+ "cont" + inventario.idinsumo +'" maxlength="15" size="15" readonly></td>';
							}
							else
							{
								strInv +='<td></td>';
							}

							strInv +='<td><label>' + inventario.unidadmedida + '</label> </td>';
							strInv +='</tr> ';
						}
						strInv +='<tr><td COLSPAN="6">';
						strInv +='<label for="comment">Observacion:</label>';
						strInv +='<textarea class="form-control" rows="3" id="observacion"></textarea>';
						strInv +='</td></tr>';
						strInv +='<tr><td COLSPAN="2"><input type="button" class="btn btn-primary btn-sd" value="Confirmar Inventario" onclick="confirmarInventario()"> </td>';
						strInv +='<td COLSPAN="2"><input type="button" class="btn btn-danger btn-sd" value="Reiniciar Inventario" onclick="reiniciarInventario()"> </td><td COLSPAN="2"></td></tr>';
						strInv +='</tbody> ';
						$('#inventario').html(strInv);
					
				} 
			});
	 $('#fechasurtir').attr('disabled', true);
	 $('#selectTiendas').attr('disabled', true);
	
}

function modificarContenedor(objeto)
{
	var idInsumoModificado = $(objeto).attr('id');
	var valorModificado = $(objeto).val();
	idInsumoModificado = idInsumoModificado.substring(4, idInsumoModificado.length );
	for(var i = 0; i < inventarios.length;i++)
	{
		if(inventarios[i].idinsumo == idInsumoModificado)
		{
			if(inventarios[i].manejacanastas == 'S')
			{
				if($.isNumeric(valorModificado))
				{
					var canastas = Math.floor(valorModificado/inventarios[i].cantidadxcanasta);
					var residuo = valorModificado % inventarios[i].cantidadxcanasta;
					if(residuo > 0 )
					{
						canastas++;
						valorModificado =  inventarios[i].cantidadxcanasta *  canastas;
					}
					$(objeto).val(valorModificado);
					$("#cont"+idInsumoModificado).val(canastas+inventarios[i].nombrecontenedor);
				}
				else
				{
					alert("El valor modificado no es númerico");
				}
			}
		}
	}
}

//Función para validar las cantidades a enviar antes de realizar la inserción consumiendo los servicios.
function validarCantidades()
{
	var mensajeError = '';
	for (var i = 0; i < inventarios.length; i++)
	{
		var inventario = inventarios[i];
		var valorCampo = $("#cant"+inventario.idinsumo).val();
		if(valorCampo != "0")
		{
			if(!validarSiNumero(valorCampo))
			{
				mensajeError = mensajeError + ' ' +  inventario.nombreinsumo;
			}
			
		}
	}
	return(mensajeError);	
}

function validarSiNumero(numero)
{
    if (!/^([0-9])*$/.test(numero))
     {
     	return(false);
     }else
     {
     	return(true);
     }
  }

//Opción que implementará la lógica para la confirmación de un inventario y de guardar la información despachada para la tienda
function confirmarInventario()
{
	if(!bandera)
	{
		$.alert("No se han cargado inventarios para confirmar");
		return;
	}
	//Se validan que los valores diferentes de cero sean numéricos
	var mensajeError = validarCantidades()
	if(mensajeError.length == 0)
	{

	}else
	{
		$.alert("Se tienen valores incorrectos en los insumos : " + mensajeError);
		return;
	}
	
	// Ser realiza la generación del excel con la información de lo que se surtira en la tienda -- comentamos para revisar  LA GENERACION
	//$("#inventariosurtir").table2excel({
	//    filename: "InventarioSurtir"
	//  }); 
	
	//Ingresamos primero el encabezado del despacho del pedido
	var fechasurtir = $("#fechasurtir").val();
	var idtienda = $("#selectTiendas option:selected").attr('id');
	var tienda = $("#selectTiendas").val();
	var observacion = encodeURIComponent($("#observacion").val().substring(0,500));
	// Variable que almacenará si se tuvieron o no errores en el proceso
	var huboErroresDespacho = false;
	var huboErroresDetalle = false;
	var insumosErorres = "";
	$.confirm({
				'title'		: 'Confirmacion de Inventario a Enviar a Tienda',
				'content'	: 'Desea el envío del intentario a la Tienda ' + tienda + '<br> Con Fecha '+ fechasurtir,
				'type': 'dark',
   				'typeAnimated': true,
				'buttons'	: {
					'Si'	: {
						'class'	: 'blue',
						'action': function(){

								$.ajax({ 
								    		url: server + 'InsertarDespachoTienda?fechasurtir=' + fechasurtir + "&idtienda=" + idtienda + "&observacion=" + observacion, 
								    		dataType: 'json', 
								    		async: false, 
								    		success: function(data1){ 
								    			respuesta = data1[0];
								    			var iddespacho = respuesta.iddespacho;
								    			if (iddespacho == 0)
								    			{
								    				huboErroresDespacho = true;
								    			}else
								    			{
								    				for (var i = 0; i < inventarios.length; i++)
													{
														var inventario = inventarios[i];
														if($("#cant"+inventario.idinsumo).val() > 0)
														{
															var cantidad = $("#cant"+inventario.idinsumo).val();
															var contenedor = $("#cont"+inventario.idinsumo).val();
															if (contenedor == undefined || contenedor == null)
															{
																contenedor = "";
															}
															var idinsumo = inventario.idinsumo;
															$.ajax({ 
													    		url: server + 'InsertarDetalleDespachoTienda?iddespacho=' + iddespacho + "&idinsumo=" + idinsumo + "&cantidad=" + cantidad + "&contenedor=" + contenedor, 
													    		dataType: 'json', 
													    		async: false, 
													    		success: function(data2){
													    			detalle = data2[0];
													    			if(detalle.iddespachodetalle == 0)
													    			{
													    				insumosErorres = insumosErrores + " " + inventario.nombreinsumo;
													    				huboErroresDetalle = true;
													    				
													    			}
													    		}
													    	});
														}
													}
													
								    			}
								    			if(huboErroresDespacho)
								    			{
								    				$.alert('Se tuvieron errores insertando el despacho');
								    			}else
								    			{
								    				if(huboErroresDetalle)
								    				{
								    					$.alert('No se insertó de manera correcta los siguientes insumos ' + insumosErrores);
								    				}else
								    				{
								    					reiniciarInventario();
														$.alert('Se ha ingresado correctamente el Inventario para La Tienda, con el despacho Número ' + iddespacho);
														//Realiza el llamado asíncrono a la generación del archivo.
														$.getJSON(server + 'GenerarArchivoDespachoTienda?idtienda=' + idtienda + '&iddespacho=' + iddespacho +  '&fecha=' + fechasurtir , function(data2){

						    						});
								    				}
								    			}
								    			
								    		}
								});
						}
					},
					'No'	: {
						'class'	: 'gray',
						'action': function(){}	// Nothing to do in this case. You can as well omit the action property.
					}
				}
			});
	
}

function reiniciarInventario()
{
	$('#fechasurtir').attr('disabled', false);
	$('#selectTiendas').attr('disabled', false);
	bandera = false;
	inventarios = "";
	var str = '';
	$('#inventario').html(str);
	$('#observacion').val(str);
}

// Método creado para confirmar que una fecha exista
function existeFecha(fecha){
      var fechaf = fecha.split("/");
      var day = fechaf[0];
      var month = fechaf[1];
      var year = fechaf[2];
      var date = new Date(year,month,'0');
      if((day-0)>(date.getDate()-0)){
            return false;
      }
      return true;
}


function validarFechaMenorActual(date1, date2){
      var fechaini = new Date();
      var fechafin = new Date();
      var fecha1 = date1.split("/");
      var fecha2 = date2.split("/");
      fechaini.setFullYear(fecha1[2],fecha1[1]-1,fecha1[0]);
      fechafin.setFullYear(fecha2[2],fecha2[1]-1,fecha2[0]);
      
      if (fechaini > fechafin)
        return false;
      else
        return true;
}

