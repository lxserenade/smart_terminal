#coding:utf8

from pymongo import MongoClient

from datetime import datetime
import csv

db_name = 'test'
collection_name = 'terminals'
csv_file = './raw_data_all.csv'   # '制表符分隔文件'
sep = '======================================='

client = MongoClient('localhost',27017)
db = client[db_name]
terminals = db[collection_name]

print('db name:'+db_name)
print('collection name:'+collection_name)
print('raw_data: \"'+csv_file+"\"")


# insert data to mongodb  
print(sep)
print('start dumping:')
print('read raw csv file...')
print('insert data to mongodb...')
with open(csv_file, 'rU') as csvfile:
	spamreader = csv.reader(csvfile,delimiter=' ', quotechar='|')
	err = 0
	dup = 0
	for line in spamreader:
		line = line[0].split(',')
		try:
			doc = {'institution':line[0],
				'terminal_name':line[1],
				'terminal_id':line[2],
				'category':line[3].split('_')[0],
				# 'touch_id':line[4],
				'click':int(line[4]),
				'date':datetime.strptime(line[5],'%Y-%m-%d')
			}
			terminals.insert(doc);
			# result = terminals.replace_one({'terminal_name':doc['terminal_name'],'category':doc['category'],'date':doc['date']},doc,True) #仅保留最新一条
			# # result = terminals.replace_one(doc,doc,True) # 保留所有相同条目			
			# dup += result.matched_count
			# print doc
		except Exception as e:
			print(line)
			print(str(e))
			err+=1
			continue
	
print('insert done')
print('error lines:'+str(err))
print('duplicate lines:'+str(dup))
print(sep)

print('check length:')
print(terminals.find().count())
print(sep)

print("db all set!")
