export const code = `

import os
import json

class Context:

  def __init__(self):
    self.map_results = {}
    self.reduce_results = {}
    self.results = self.map_results

  def write(self, key, value):
    if key in self.results:
      self.results[key] += [value]
    else:
      self.results[key] = [value]

  def reduce(self):
    self.results = self.reduce_results
    for key, values in self.map_results.items():
      fred(key, values)

context = Context()

with open('/map_code.py') as map_code:
  exec(map_code.read())

with open('/input.txt') as input:
  results = list(map(fmap, input.readlines()))

with open('/map_results.txt', 'w') as result_file:
  json.dump(context.map_results, result_file)

with open('/reduce_code.py') as reduce_code:
  exec(reduce_code.read())

context.reduce()

with open('/reduce_results.txt', 'w') as result_file:
  json.dump(context.reduce_results, result_file) 
  
`
