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

context = Context()

if os.path.exists('/reduce_keys.json'):
  with open('/reduce_code.py') as reduce_code:
    exec(reduce_code.read())

  with open('/reduce_keys.json') as reduce_keys_file:
    reduce_keys = json.load(reduce_keys_file)

  context.reduce(reduce_keys)

  with open('/reduce_results.txt', 'w') as result_file:
    json.dump(context.reduce_results, result_file)

else:

  with open('/map_code.py') as map_code:
    exec(map_code.read())

  with open('/input.txt') as input:
    results = list(map(fmap, input.readlines()))

  with open('/map_results.txt', 'w') as result_file:
    json.dump(context.map_results, result_file)

  with open('/combiner_code.py') as combiner_code:
    exec(combiner_code.read())

  context.combine()

  with open('/combiner_results.txt', 'w') as result_file:
    json.dump(context.combine_results, result_file) 

`
