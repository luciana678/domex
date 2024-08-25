''' Dataset tráfico
	Este dataset contiene el tracking de vehículos virtuales que transitan
	por una ciudad de 100 calles y 100 avenidas.
	Cada vez que un vehículo llega a una nueva esquina, se registra la
	información de la esquina (calle, avenida) donde llegó junto con el 
	tiempo (en segundos) que tardó en llegar de la esquina anterior.
	Si la esquina donde llegó era el final del viaje, también se 
	registra el destino (Escuela, Farmacia, Ferreteria, Hospital, Museo, Otro, Plaza, Supermercado).

Formato del dataset (cinco columnas, separadas por tabuladores)
	ID_Vehiculo		Calle		Avenida		Tiempo		Destino
'''

''' Problema:
		Obtener todas las esquinas distintas por las cuales pasaron por
		lo menos un vehículo.
		SQL equivalente:
			SELECT DISTINCT Calle, Avenida
			FROM Trafico
'''

def fmap(value):   
  tmp = value.split("\t")
  key = tmp[0]
  value = "\t".join(tmp[1:])

  data = value.split('\t')
  # La clave intermedia es una tupla
  write((data[0], data[1]), None)

def fred(key, values):
  	# La clave es única. El "DISTINCT" lo resuelve el propio framework
	write(key, None)
