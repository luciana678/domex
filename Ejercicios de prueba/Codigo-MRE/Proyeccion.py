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

from MRE import Job

inputPath = '../input/Input-Trafico'
outputPath = '../output'

def fmap(key, value, context):
	data = value.split('\t')
	# La clave intermedia es una tupla
	context.write((data[0], data[1]), None)
	
# Este job no necesita un combiner
	
def fred(key, values, context):
	# La clave es única. El "DISTINCT" lo resuelve el propio framework
	context.write(key, None)
	
job = Job(inputPath, outputPath, fmap, fred)
if job.waitForCompletion():
	print('OK')
else:
	print('Error')
