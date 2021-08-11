import {toStr} from '/lib/util';
import {run} from '/lib/xp/context';
import {connect} from '/lib/xp/node';
import {create as createRepo} from '/lib/xp/repo';
import {executeFunction} from '/lib/xp/task';
import {reference} from '/lib/xp/value';


const PERMISSIONS = [{
	principal: 'role:system.admin',
	allow: [
		'READ',
		'CREATE',
		'MODIFY',
		'DELETE',
		'PUBLISH',
		'READ_PERMISSIONS',
		'WRITE_PERMISSIONS'
	],
	deny: []
}];


function task() {
	run({
		repository: app.name,
		branch: 'master',
		principals: ['role:system.admin']
	}, () => {
		const createRepoParams = {
			id: app.name,
			rootPermissions: PERMISSIONS
		};
		log.info(`createRepoParams:${toStr(createRepoParams)}`);
		try {
			createRepo(createRepoParams);
		} catch (e) {
			log.error(`e:${toStr(e)}`);
		}
		const connectParams = {
			branch: 'master',
			repoId: app.name,
			principals: ['role:system.admin']
		};
		log.info(`connectParams:${toStr(connectParams)}`);
		const connection = connect(connectParams);
		const rootNode = connection.get('/');
		log.info(`rootNode:${toStr(rootNode)}`);
		const { _id:rootId } = rootNode;
		log.info(`rootId:${toStr(rootId)}`);

		const createNodeParams = {
			//_childOrder: '_ts DESC',
			_indexConfig: {
				default: {
					decideByType: true,
					enabled: true,
					nGram: false,
					fulltext: false,
					includeInAllText: false,
					path: false,
					indexValueProcessors: [],
					languages: []
				},
				configs: [/*{
					path: 'rootId',
					config: {
						decideByType: false,
						enabled: true,
						nGram: false,
						fulltext: false,
						includeInAllText: false,
						path: false
					}
				},{
					path: 'referenceRootId',
					config: {
						decideByType: false,
						enabled: true,
						nGram: false,
						fulltext: false,
						includeInAllText: false,
						path: false
					}
				},{
					path: 'decideByTypeRootId',
					config: {
						decideByType: true,
						enabled: true,
						nGram: false,
						fulltext: false,
						includeInAllText: false,
						path: false
					}
				},{
					path: 'decideByTypereferenceRootId',
					config: {
						decideByType: true,
						enabled: true,
						nGram: false,
						fulltext: false,
						includeInAllText: false,
						path: false
					}
				}*/]
			},
			//_inheritsPermissions: true,
			_name: 'node',
			//_path: '/node',
			//_state: 'DEFAULT',
			_nodeType: 'whatever',
			rootId: rootId,
			referenceRootId: reference(rootId),
			decideByTypeRootId: rootId,
			decideByTypereferenceRootId: reference(rootId)
		};
		log.info(`createNodeParams:${toStr(createNodeParams)}`);
		try {
			connection.delete(createNodeParams);
		} catch (e) {
			log.error(`e:${toStr(e)}`);
		}
		try {
			const createdNode = connection.create(createNodeParams);
			log.info(`createdNode:${toStr(createdNode)}`);
		} catch (e) {
			log.error(`e:${toStr(e)}`);
		}

		// Refresh the index for the current repoConnection. The index has two parts, search and storage. It is possible to index both or just one of them.
		connection.refresh();

		log.info('Inspect the type of rootId, referenceRootId, decideByTypeRootId and decideByTypereferenceRootId with data toolbox...');
	}); // context.run
} // function task

executeFunction({
	description: '',
	func: task
});
