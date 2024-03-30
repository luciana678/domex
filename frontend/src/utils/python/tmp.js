export const PY_MAIN_CODE = `

import os
import json
import sys

class Context:

  def __init__(self):
    self.map_results = {}
    self.combine_results = {}
    self.reduce_results = {}
    self.results = self.map_results

  def write(self, key, value):
    if key in self.results:
      self.results[key] += [value]
    else:
      self.results[key] = [value]

  def combine(self):
    self.results = self.combine_results
    for key, values in self.map_results.items():
      fcomb(key, values)

  def reduce(self, reduce_keys):
    self.results = self.reduce_results
    for key, values in reduce_keys.items():
      fred(key, values)

def safe_execute(name, func):
  try:
    return func()
  except Exception as e:
    with open('/stderr.json', 'w') as errors_file:
      json.dump({name: f"[{name}] -> {str(e)}"}, errors_file)
    sys.exit(0)

context = Context()

sizes = {}

if os.path.exists('/reduce_keys.json'):

  with open('/reduce_code.py') as reduce_code:
    exec(reduce_code.read())

  with open('/reduce_keys.json') as reduce_keys_file:
    reduce_keys = json.load(reduce_keys_file)
  sizes['reduceInput'] = os.path.getsize("/reduce_keys.json")

  safe_execute('reduceCode', lambda: context.reduce(reduce_keys))

  with open('/reduce_results.txt', 'w') as result_file:
    json.dump(context.reduce_results, result_file)
  sizes['reduceOutput'] = os.path.getsize("/reduce_results.txt")
  print("REDUCE EJECUTADO SATISFACTORIAMENTE")

else:
  with open('/map_code.py') as map_code:
    exec(map_code.read())
    
  with open('/input.txt') as input:
    results = safe_execute('mapCode', lambda: list(map(fmap, input.readlines())))
  sizes['mapInput'] = os.path.getsize("/input.txt")

  with open('/map_results.txt', 'w') as result_file:
    json.dump(context.map_results, result_file)
  sizes['mapOutput'] = os.path.getsize('/map_results.txt')
  print("MAP EJECUTADO SATISFACTORIAMENTE")

  empty_combine = False
  with open('/combiner_code.py') as combiner_code:
    code = combiner_code.read()
    empty_combine = not code.strip()
    exec(code)

  if not empty_combine:
    safe_execute('combineCode', lambda: context.combine())

  with open('/combiner_results.txt', 'w') as result_file:
    results = context.map_results if empty_combine else context.combine_results
    json.dump(results, result_file) 
  sizes['combinerOutput'] = os.path.getsize('/combiner_results.txt')
  print("COMBINE EJECUTADO SATISFACTORIAMENTE")

with open('/sizes.json', 'w') as sizes_file:
  json.dump(sizes, sizes_file)

if os.path.exists('/stderr.json'):
  os.remove("/stderr.json")
`
