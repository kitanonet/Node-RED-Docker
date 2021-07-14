module.exports = function(RED) {

	//var globalContext = this.context().global;

	function SelectVariables(config){
		function CreateOpcServerMessages(editableList){
			var db=editableList.db
			var struct=editableList.struct
			var rules=editableList.rules
	
			console.log(db+" "+struct)
			console.log(rules)
	
			var msg1=[]
			var msg2=[]
			var msg3=[]
			var actions=[]

			var variable,action,value,type

			Object.keys(rules).forEach(key=>{
				

				variable=db+"."+struct+"."+key
				action=rules[key].action
				value=rules[key].value
				type=rules[key].type

				var parsedVal

				switch (type){
					case 'Boolean':
						parsedVal=(value=='true')
						break
					case 'Int16':
						parsedVal=parseInt(value)
						break
					case 'Double':
						parsedVal=parseFloat(value)
						break
					default:
						parsedVal=value

				}

				console.log(variable+" "+action+" "+type+" "+value)
				console.log(typeof value+":"+value+";"+typeof parsedVal+":"+parsedVal)
				switch (action) {
					case 'READ':
						msg1.push({
							'topic':"ns=3;s="+variable
						})
						actions.push({READ:{topic:"ns=3;s="+variable,payload:parsedVal}})
						break;
	
					case 'WRITE':
						msg2.push({
							'topic':"ns=3;s="+variable,
							'payload':parsedVal,
							'datatype':type
						})
						actions.push({WRITE:{topic:"ns=3;s="+variable,payload:parsedVal}})
						break;
	
					case 'SET':
						msg3.push({'topic':"",
							'payload':{
							"messageType": "Variable",
							"variableName": "3:"+variable,
							"variableValue": parsedVal
						}})
						actions.push({SET:{variableName:"3:"+variable,variableValue:parsedVal}})
						break;
				}	
			})
			//console.log(msg1)
			//console.log(msg2)
			//console.log(msg3)
			//console.log("merged msg1 msg2 msg3:")
			//console.log(msg1.concat(msg2).concat(msg3))
			//return [msg1,msg2,msg3]
			return {READ:msg1,WRITE:msg2,SET:msg3,ACTIONS:actions}
		}	

		RED.nodes.createNode(this,config);
		console.log('creating node')
		console.log(config)
		var node = this;
		
        node.select=config.select
		node.select2=config.select2
		node.editableList=config.editableList
		node.typedInputJSON=config.typedInputJSON
		node.orderedList=config.orderedList

		Object.keys(node.editableList).forEach((key,id,arr)=>{
			console.log(id+" "+key)
			var obj = node.editableList[key]
			console.log(typeof(obj))
			console.log(obj)
		})

		//console.log(node.conffile)
		//console.log(node.editableList)
		
		node.on('input',function(msg,send,done){
			console.log(node.editableList)
			var messages=CreateOpcServerMessages(node.editableList)
			console.log(messages)
			var msg1=Object.values(messages.READ)
			var msg2=Object.values(messages.WRITE)
			var msg3=Object.values(messages.SET)
			var actions=Object.values(messages.ACTIONS)
			//send([{payload:messages},msg1,msg2,msg3])
			send([{payload:actions},msg1,msg2,msg3])
			done()
		});
		console.log('node created')
	}
	
	RED.nodes.registerType("select-variables",SelectVariables)
}