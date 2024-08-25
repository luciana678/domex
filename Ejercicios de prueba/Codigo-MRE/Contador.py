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
		Contar la cantidad de viajes a cada destino diferente.
		(Es de la familia del wordcount, pero con un filtro)
		SQL equivalente:
			SELECT Count(*)
			FROM Trafico
			WHERE Destino <> ""
			GROUP BY Destino
'''

from MRE import Job

inputPath = '../input/Input-Trafico'
outputPath = '../output'

def fmap(key, value, context):
	data = value.split('\t')
	if data[3] != "":
		context.write(data[3], 1)
	
def fcom(key, values, context):
	cont = 0
	for data in values:
		cont+= data
			
	context.write(key, cont)
	
def fred(key, values, context):
	cont = 0
	for data in values:
		cont+= data
			
	context.write(key, cont)
	
job = Job(inputPath, outputPath, fmap, fred)
job.setCombiner(fcom)
if job.waitForCompletion():
	print('OK')
else:
	print('Error')
