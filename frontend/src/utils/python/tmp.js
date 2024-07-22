export const PY_MAIN_CODE = `

import os, json, sys, time

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
  start_time = time.perf_counter_ns()

  try:
    result = func()
    finish_time = time.perf_counter_ns()
    sizes[f'{name}Time'] = finish_time - start_time
    return result
  except Exception as e:
    with open('/stderr.json', 'w') as errors_file:
      json.dump({name: f"[{name}] -> {str(e)}"}, errors_file)
    sys.exit(0)

def safe_key_write(dict_to_write, file_name):
  with open(file_name, 'w') as file:
    json.dump({str(k) if isinstance(k, tuple) else k: v for k, v in dict_to_write.items()}, file)

context = Context()

sizes = {}

if os.path.exists('/reduce_keys.json'):

  with open('/reduce_code.py') as reduce_code:
    exec(reduce_code.read())

  with open('/reduce_keys.json') as reduce_keys_file:
    reduce_keys = json.load(reduce_keys_file)
  sizes['reduceInput'] = os.path.getsize("/reduce_keys.json")

  safe_execute('reduceCode', lambda: context.reduce({eval(k) if k.startswith("(") and k.endswith(")") else k: v for k, v in reduce_keys.items()}))

  safe_key_write(context.reduce_results, '/reduce_results.json')

  sizes['reduceOutput'] = os.path.getsize("/reduce_results.json")
  sizes['reduceCount'] = len(context.reduce_results)

  print("REDUCE EJECUTADO SATISFACTORIAMENTE")

else:
  with open('/map_code.py') as map_code:
    exec(map_code.read())
    
  with open('/input.txt') as input:
    input_lines = input.readlines()
    results = safe_execute('mapCode', lambda: list(map(fmap, input_lines)))
  sizes['mapInput'] = os.path.getsize("/input.txt")
  sizes['mapCount'] = len(input_lines)

  safe_key_write(context.map_results, '/map_results.json')
  
  sizes['mapOutput'] = os.path.getsize('/map_results.json')
  print("MAP EJECUTADO SATISFACTORIAMENTE")

  empty_combine = False
  with open('/combine_code.py') as combine_code:
    code = combine_code.read()
    empty_combine = not code.strip()
    exec(code)

  if not empty_combine:
    safe_execute('combineCode', lambda: context.combine())
    sizes['combineCount'] = len(context.map_results)
    results = context.combine_results
  else:
    sizes['combineCount'] = 0
    results = context.map_results

  safe_key_write(results, '/combine_results.json')

  sizes['combineOutput'] = os.path.getsize('/combine_results.json')

  if not empty_combine:
    print("COMBINE EJECUTADO SATISFACTORIAMENTE")

with open('/sizes.json', 'w') as sizes_file:
  json.dump(sizes, sizes_file)

if os.path.exists('/stderr.json'):
  os.remove("/stderr.json")
`
