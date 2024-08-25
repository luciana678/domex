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
		Obtener la cantidad de esquinas visitadas, promedio de tiempos, mínima calle y maxima avenida para cada vehículo.
		SQL equivalente:
			SELECT Count(*), Avg(Tiempo), Min(Calle), Max(Avenida)
			FROM Trafico
			GROUP BY ID_Vehiculo
'''

def fmap(value):
  value = value.split('\t')
  key = value[0]
  data = value[1:]
  for i in range(3):
    data[i] = int(data[i]) # Convierto a enteros calle, avenida y tiempo
  data[3] = 1 			   # La posición donde está el destino la uso para el contador
                           # inicializada en 1, para contar "ésta" esquina
  write(key, data)

def fcomb(key, values):
	minima = 101
	maxima = 0
	cantesq = 0
	sumatiem = 0
	for data in values:
		cantesq+= data[3]   # acumulo esquinas visitadas
		sumatiem+= data[2]  # acumulo tiempos
		minima = data[0] if data[0] < minima else minima
		maxima = data[1] if data[1] > maxima else maxima

	write(key, (minima, maxima, sumatiem, cantesq))

def fred(key, values):
	minima = 101
	maxima = 0
	cantesq = 0
	sumatiem = 0
	for data in values:
		cantesq+= data[3]   # acumulo esquinas visitadas
		sumatiem+= data[2]  # acumulo tiempos
		minima = data[0] if data[0] < minima else minima
		maxima = data[1] if data[1] > maxima else maxima

	write(key, (minima, maxima, sumatiem / cantesq, cantesq))
