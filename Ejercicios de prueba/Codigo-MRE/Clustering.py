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
		Ejecutar una iteración del algoritmo k-means.
		
		k-means es un algoritmo iterativo que debería ejecutar el job
		en cada iteracion de pesos.
		Este algoritmo no se puede ejecutar en Domex, porque no tenemos
		una sección para código del main
		
		Pseudocódigo del main:
			while not converja():
				job.waitForCompletion()
				recalcularCentroides()
				
		Los métodos converja() y recalcularCentroides() son ejecutados
		por el master de forma secuencial.
'''

from MRE import Job
from math import sqrt

inputPath = '../input/Input-Trafico'
outputPath = '../output'

def fmap(key, value, context):
	# Centroides debería se un parámetro del job ya que es un valor que cambia de una iteración a otra. 
  	# Domex no tiene esta funcionalidad, por lo tanto, en este ejemplo se utilizará un valor fijo.
	centroides = [ (50, 50) , (75,75), (25,25), (25,75), (75,25)]
	
	data = value.split('\t')
	x1 = int(data[0])
	y1 = int(data[1])
	
	mascerca = (0, 1000)
	
	# Buscar la esquina más cercana a la "actual"
	for i in range(len(centroides)):
		# calculo distancia
		x2 = centroides[i][0]
		y2 = centroides[i][1]
		
		dist = sqrt((x1-x2)**2 + (y1-y2)**2)
		
		if dist < mascerca[1]:
			mascerca = (i, dist)
	
	# Solo envío la esquina y el índice del "cluster" más cercano. 
	# También necesito contar la cantidad de esquinas por "cluster", 
	# por eso el tercer elemento en la tupla pasada como valor.
	context.write(mascerca[0], (x1, y1, 1))
	
def fcom(key, values, context):
	sumcalle = 0
	sumave = 0
	cantesq = 0

	for data in values:
		cantesq+= data[2]  # acumulo esquinas del "cluster"
		sumave+= data[1]   # sumo los valores de las avenidas
		sumcalle+= data[0] # sumo los valores de las calles
			
	context.write(key, (sumcalle, sumave, cantesq))
	
def fred(key, values, context):
	sumcalle = 0
	sumave = 0
	cantesq = 0

	for data in values:
		cantesq+= data[2]  # acumulo esquinas del "cluster"
		sumave+= data[1]   # sumo los valores de las avenidas
		sumcalle+= data[0] # sumo los valores de las calles
		
	context.write(key, ((sumcalle / cantesq), (sumave / cantesq)))
	# Los cinco pares de valores resultados del job son los nuevos centroides y
	# deberían reemplazar a los valores hardcodeados en la función map
	
job = Job(inputPath, outputPath, fmap, fred)
job.setCombiner(fcom)
if job.waitForCompletion():
	print('OK')
else:
	print('Error')
