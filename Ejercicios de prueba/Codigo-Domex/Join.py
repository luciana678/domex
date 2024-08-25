''' 
Dataset Trafico
---------------
	Este dataset contiene el tracking de vehículos virtuales que transitan
	por una ciudad de 100 calles y 100 avenidas.
	Cada vez que un vehículo llega a una nueva esquina, se registra la
	información de la esquina (calle, avenida) donde llegó junto con el 
	tiempo (en segundos) que tardó en llegar de la esquina anterior.
	Si la esquina donde llegó era el final del viaje, también se 
	registra el destino (Escuela, Farmacia, Ferreteria, Hospital, Museo, Otro, Plaza, Supermercado).

Formato del dataset (cinco columnas, separadas por tabuladores)
	ID_Vehiculo		Calle		Avenida		Tiempo		Destino
	
Dataset Vehiculo
----------------
	Este dataset contiene para cada vehículo de la ciudad el nombre del dueño	.
	
Formato del dataset (cinco columnas, separadas por tabuladores)
	Nombre		ID
'''

''' Problema:
		Obtener para cada dueño de vehículo los destinos visitados.
		El Join es 1 a 1. Los nombres de los dueños no se repiten y cada dueño solo tiene un vehículo.
		
		SQL equivalente:
			SELECT Vehiculo.Nombre, Trafico.Destino
			FROM Trafico INNER JOIN Vehiculo ON Trafico.ID_Vehiculo = Vehiculo.ID
'''

def fmap(value):   
  key = value.split('\t')[0]

  try:
    key = int(key)  # Si puede convertirse a int, entonces viene del dataset Trafico
    trafico = True
  except:
    trafico = False
      
  if trafico:
    # Viene del dataset Trafico
    data = value.split("\t")
    if(data[4] != ""):
      # Uso el ID_Vehiculo como clave intermedia
      write(key, ("T", data[4]))
  else:
    # Viene del dataset Vehiculo

    # Uso el ID del vehiculo como clave intermedia
    write(int(value.split('\t')[1]), ("V", key))

def fred(key, values):
    destinos = []
    nombre = None
    
    for data in values:    
        # Ningún framework debería dar garantías de que valor se recibe primero:
        # si el de la tupla que viene del dataset Trafico o el de la tupla que viene del dataset Vehiculo.
        # El nombre del dueño podría ser la primera tupla de valores, la última, 
        # o estar en el medio de muchas otras tuplas "destino" 
    
        if data[0] == "T":
            destinos.append(data[1])
        else:
            nombre = data[1]

    for d in destinos:
        write(nombre, d)