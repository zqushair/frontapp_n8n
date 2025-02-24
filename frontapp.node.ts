import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeExecutionData,
	INodeProperties,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

// Interfaces (optional but recommended)
interface FrontappCommentCreateRequest {
	body: string;
	is_pinned: boolean;
}

interface FrontappComment {
	id: string;
	body: string;
	is_pinned: boolean;
	// ... other properties as needed
}

interface FrontappConversation {
	id: string;
	subject: string;
	// ... other conversation properties
}

export class Frontapp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Frontapp',
		name: 'frontapp',
		icon: 'file:frontapp.png',
		group: ['transform'],
		version: 1,
		description: 'Consume the Frontapp API',
		defaults: {
			name: 'Frontapp',
			color: '#6ad7b9',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'frontappApi',
				required: true,
				description: 'Frontapp API Credentials',
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{ name: 'Comment', value: 'comment' },
					{ name: 'Conversation', value: 'conversation' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Contact Group', value: 'contactGroup' },
					{ name: 'Message', value: 'message' },
					{ name: 'Draft', value: 'draft' },
					{ name: 'Tag', value: 'tag' },
				],
				default: 'comment',
				required: true,
				description: 'The resource to operate on.',
			},
			// --------- Comments Operations ---------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['comment'],
					},
				},
				options: [
					{ name: 'Create', value: 'create' },
					{ name: 'Get', value: 'get' },
					{ name: 'Update', value: 'update' },
					{ name: 'List Conversation Comments', value: 'listComments' },
					{ name: 'List Comment Mentions', value: 'listMentions' },
				],
				default: 'create',
				required: true,
				description: 'Operation to perform on comments.',
			},
			{
				displayName: 'Conversation ID',
				name: 'conversationId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['comment'],
						operation: ['create'],
					},
				},
				default: '',
				required: true,
				description: 'ID of the conversation to add the comment to.',
			},
			{
				displayName: 'Comment Body',
				name: 'body',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['comment'],
						operation: ['create'],
					},
				},
				default: '',
				required: true,
				description: 'Content of the comment.',
			},
			{
				displayName: 'Pin Comment',
				name: 'is_pinned',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['comment'],
						operation: ['create'],
					},
				},
				default: false,
				description: 'Whether to pin the comment.',
			},
			{
				displayName: 'Comment ID',
				name: 'commentId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['comment'],
						operation: ['get', 'update', 'listMentions'],
					},
				},
				default: '',
				required: true,
				description: 'The comment ID.',
			},
			{
				displayName: 'Updated Comment Body',
				name: 'updateBody',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['comment'],
						operation: ['update'],
					},
				},
				default: '',
				required: true,
				description: 'New content for the comment.',
			},
			{
				displayName: 'Pin Comment (Update)',
				name: 'updatePinned',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['comment'],
						operation: ['update'],
					},
				},
				default: false,
				description: 'Whether to pin the updated comment.',
			},
			{
				displayName: 'Conversation ID (for listing comments)',
				name: 'convIdForComments',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['comment'],
						operation: ['listComments'],
					},
				},
				default: '',
				required: true,
				description: 'Conversation ID to retrieve comments from.',
			},
			// --------- Conversations Operations ---------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: { resource: ['conversation'] },
				},
				options: [
					{ name: 'Get', value: 'get' },
					{ name: 'List', value: 'list' },
					{ name: 'Create Discussion', value: 'createDiscussion' },
					{ name: 'Update', value: 'update' },
					{ name: 'Add Followers', value: 'addFollowers' },
					{ name: 'Remove Followers', value: 'removeFollowers' },
					{ name: 'Add Links', value: 'addLinks' },
					{ name: 'Remove Links', value: 'removeLinks' },
					{ name: 'List Messages', value: 'listMessages' },
					{ name: 'List Events', value: 'listEvents' },
				],
				default: 'get',
				required: true,
				description: 'Operation to perform on conversations.',
			},
			{
				displayName: 'Conversation ID',
				name: 'conversationId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['conversation'],
						operation: ['get', 'update', 'addFollowers', 'removeFollowers', 'addLinks', 'removeLinks', 'listMessages', 'listEvents'],
					},
				},
				default: '',
				required: true,
				description: 'The conversation ID.',
			},
			{
				displayName: 'Filter Query (JSON)',
				name: 'convFilter',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['conversation'],
						operation: ['list'],
					},
				},
				default: '',
				description: 'Optional JSON string for filtering the list of conversations.',
			},
			{
				displayName: 'Subject',
				name: 'convSubject',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['conversation'],
						operation: ['createDiscussion'],
					},
				},
				default: '',
				required: true,
				description: 'Subject for the discussion conversation.',
			},
			{
				displayName: 'Comment Body (Discussion)',
				name: 'convBody',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['conversation'],
						operation: ['createDiscussion'],
					},
				},
				default: '',
				required: true,
				description: 'Initial comment for the discussion conversation.',
			},
			{
				displayName: 'Update Data (JSON)',
				name: 'convUpdateData',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['conversation'],
						operation: ['update'],
					},
				},
				default: '{}',
				description: 'JSON object with fields to update (e.g., {"assignee_id": "tea_xxx", "status": "archived"}).',
			},
			{
				displayName: 'Follower IDs (comma-separated)',
				name: 'followerIds',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['conversation'],
						operation: ['addFollowers', 'removeFollowers'],
					},
				},
				default: '',
				required: true,
				description: 'Comma-separated list of teammate IDs.',
			},
			{
				displayName: 'Link Data (JSON)',
				name: 'linkData',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['conversation'],
						operation: ['addLinks', 'removeLinks'],
					},
				},
				default: '{}',
				description: 'JSON object with link information (e.g., {"link_ids": ["top_123"]} or {"link_links": ["https://example.com"]}).',
			},
			// --------- Contacts Operations ---------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: { resource: ['contact'] },
				},
				options: [
					{ name: 'List', value: 'list' },
					{ name: 'Get', value: 'get' },
					{ name: 'Create', value: 'create' },
					{ name: 'Update', value: 'update' },
					{ name: 'Delete', value: 'delete' },
					{ name: 'Merge', value: 'merge' },
					{ name: 'Add Handle', value: 'addHandle' },
					{ name: 'Delete Handle', value: 'deleteHandle' },
					{ name: 'Get Notes', value: 'getNotes' },
					{ name: 'Add Note', value: 'addNote' },
				],
				default: 'list',
				required: true,
				description: 'Operation to perform on contacts.',
			},
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['get', 'update', 'delete', 'merge', 'addHandle', 'deleteHandle', 'getNotes', 'addNote'],
					},
				},
				default: '',
				required: true,
				description: 'The contact ID.',
			},
			{
				displayName: 'Contact Data (JSON)',
				name: 'contactData',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['create', 'update'],
					},
				},
				default: '{}',
				description: 'JSON object with contact fields.',
			},
			{
				displayName: 'Merge Data (JSON)',
				name: 'mergeData',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['merge'],
					},
				},
				default: '{}',
				description: 'JSON object with merge data (e.g., {"contact_ids": ["ctc_xxx", "ctc_yyy"]}).',
			},
			{
				displayName: 'Handle Data (JSON)',
				name: 'handleData',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['addHandle', 'deleteHandle'],
					},
				},
				default: '{}',
				description: 'JSON object with handle info, e.g., {"handle": "user@example.com", "source": "email"}.',
			},
			{
				displayName: 'Note Data (JSON)',
				name: 'noteData',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['addNote'],
					},
				},
				default: '{}',
				description: 'JSON object with note data, e.g., {"author_id": "user@example.com", "body": "Note text"}.',
			},
			// --------- Contact Groups Operations ---------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: { resource: ['contactGroup'] },
				},
				options: [
					{ name: 'List', value: 'list' },
					{ name: 'Create', value: 'create' },
					{ name: 'Delete', value: 'delete' },
					{ name: 'List Group Contacts', value: 'listContacts' },
					{ name: 'Add Contacts', value: 'addContacts' },
					{ name: 'Remove Contacts', value: 'removeContacts' },
				],
				default: 'list',
				required: true,
				description: 'Operation to perform on contact groups.',
			},
			{
				displayName: 'Group ID',
				name: 'groupId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['contactGroup'],
						operation: ['delete', 'listContacts', 'addContacts', 'removeContacts'],
					},
				},
				default: '',
				required: true,
				description: 'The contact group ID.',
			},
			{
				displayName: 'Group Data (JSON)',
				name: 'groupData',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['contactGroup'],
						operation: ['create'],
					},
				},
				default: '{}',
				description: 'JSON object with group data, e.g., {"name": "New Group"}.',
			},
			{
				displayName: 'Contact IDs (comma-separated)',
				name: 'groupContactIds',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['contactGroup'],
						operation: ['addContacts', 'removeContacts'],
					},
				},
				default: '',
				required: true,
				description: 'Comma-separated list of contact IDs.',
			},
			// --------- Messages Operations ---------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: { resource: ['message'] },
				},
				options: [
					{ name: 'Get', value: 'get' },
					{ name: 'Get Source', value: 'getSource' },
					{ name: 'Send New Message', value: 'send' },
					{ name: 'Send Reply', value: 'sendReply' },
					{ name: 'Import Message', value: 'import' },
					{ name: 'Receive Custom Message', value: 'receiveCustom' },
					{ name: 'Mark as Seen', value: 'markSeen' },
				],
				default: 'get',
				required: true,
				description: 'Operation to perform on messages.',
			},
			{
				displayName: 'Message ID',
				name: 'messageId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['get', 'getSource', 'markSeen'],
					},
				},
				default: '',
				required: true,
				description: 'The message ID.',
			},
			{
				displayName: 'Channel ID',
				name: 'channelId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send'],
					},
				},
				default: '',
				required: true,
				description: 'Channel ID for sending the message.',
			},
			{
				displayName: 'To (comma-separated)',
				name: 'messageTo',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send'],
					},
				},
				default: '',
				required: true,
				description: 'Comma-separated list of recipient handles.',
			},
			{
				displayName: 'Subject',
				name: 'messageSubject',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send'],
					},
				},
				default: '',
				description: 'Message subject (optional).',
			},
			{
				displayName: 'Message Body',
				name: 'messageBody',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send', 'sendReply'],
					},
				},
				default: '',
				required: true,
				description: 'Content of the message.',
			},
			{
				displayName: 'Reply Channel ID',
				name: 'replyChannelId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendReply'],
					},
				},
				default: '',
				required: true,
				description: 'Channel ID to send the reply from.',
			},
			{
				displayName: 'Inbox ID',
				name: 'inboxId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['import'],
					},
				},
				default: '',
				required: true,
				description: 'Inbox ID to import the message into.',
			},
			{
				displayName: 'Import Message Data (JSON)',
				name: 'importMessageData',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['import'],
					},
				},
				default: '{}',
				description: 'JSON object with import message data.',
			},
			{
				displayName: 'Custom Message Data (JSON)',
				name: 'customMessageData',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['receiveCustom'],
					},
				},
				default: '{}',
				description: 'JSON object with custom message data.',
			},
			// --------- Drafts Operations ---------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: { resource: ['draft'] },
				},
				options: [
					{ name: 'Create Draft', value: 'create' },
					{ name: 'List Drafts', value: 'list' },
					{ name: 'Create Draft Reply', value: 'createReply' },
					{ name: 'Delete Draft', value: 'delete' },
					{ name: 'Edit Draft', value: 'edit' },
				],
				default: 'create',
				required: true,
				description: 'Operation to perform on drafts.',
			},
			{
				displayName: 'Conversation ID',
				name: 'draftConversationId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['draft'],
						operation: ['create', 'list', 'createReply'],
					},
				},
				default: '',
				required: true,
				description: 'Conversation ID for the draft.',
			},
			{
				displayName: 'Draft Data (JSON)',
				name: 'draftData',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['draft'],
						operation: ['create'],
					},
				},
				default: '{}',
				description: 'JSON object with draft data.',
			},
			{
				displayName: 'Draft Reply Data (JSON)',
				name: 'draftReplyData',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['draft'],
						operation: ['createReply'],
					},
				},
				default: '{}',
				description: 'JSON object with draft reply data.',
			},
			{
				displayName: 'Draft ID',
				name: 'draftId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['draft'],
						operation: ['delete', 'edit'],
					},
				},
				default: '',
				required: true,
				description: 'ID of the draft.',
			},
			{
				displayName: 'Draft Edit Data (JSON)',
				name: 'draftEditData',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['draft'],
						operation: ['edit'],
					},
				},
				default: '{}',
				description: 'JSON object with data to update the draft.',
			},
			// --------- Tags Operations ---------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: { resource: ['tag'] },
				},
				options: [
					{ name: 'List', value: 'list' },
					{ name: 'Get', value: 'get' },
					{ name: 'Create', value: 'create' },
					{ name: 'Update', value: 'update' },
					{ name: 'Delete', value: 'delete' },
					{ name: 'List Conversations', value: 'listConversations' },
				],
				default: 'list',
				required: true,
				description: 'Operation to perform on tags.',
			},
			{
				displayName: 'Tag ID',
				name: 'tagId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['tag'],
						operation: ['get', 'update', 'delete', 'listConversations'],
					},
				},
				default: '',
				required: true,
				description: 'The tag ID.',
			},
			{
				displayName: 'Tag Data (JSON)',
				name: 'tagData',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['tag'],
						operation: ['create', 'update'],
					},
				},
				default: '{}',
				description: 'JSON object with tag data, e.g., {"name": "New Tag"}.',
			},
		],
	};

	/**
	 * Helper function that wraps httpRequestWithAuthentication with retry logic.
	 */
	private async makeApiRequest(method: string, url: string, body?: IDataObject, qs?: IDataObject): Promise<any> {
		const retryOptions = { retries: 3, factor: 2, minTimeout: 1000, maxTimeout: 4000 };
		return await this.helpers.retry.call(this, retryOptions, async () => {
			return this.helpers.httpRequestWithAuthentication.call(this, 'frontappApi', {
				method,
				url,
				body,
				qs,
				json: true,
			});
		});
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				let responseData: any;

				// ---------------- COMMENTS ----------------
				if (resource === 'comment') {
					if (operation === 'create') {
						const convId = this.getNodeParameter('conversationId', i) as string;
						const bodyContent = this.getNodeParameter('body', i) as string;
						const isPinned = this.getNodeParameter('is_pinned', i, false) as boolean;
						const requestBody: FrontappCommentCreateRequest = { body: bodyContent, is_pinned: isPinned };
						responseData = await this.makeApiRequest('POST', `https://api.frontapp.com/conversations/${convId}/comments`, requestBody);
					} else if (operation === 'get') {
						const commentId = this.getNodeParameter('commentId', i) as string;
						responseData = await this.makeApiRequest('GET', `https://api.frontapp.com/comments/${commentId}`);
					} else if (operation === 'update') {
						const commentId = this.getNodeParameter('commentId', i) as string;
						const updateBody = this.getNodeParameter('updateBody', i) as string;
						const updatePinned = this.getNodeParameter('updatePinned', i, false) as boolean;
						const updateData = { body: updateBody, is_pinned: updatePinned };
						responseData = await this.makeApiRequest('PATCH', `https://api.frontapp.com/comments/${commentId}`, updateData);
					} else if (operation === 'listComments') {
						const convId = this.getNodeParameter('convIdForComments', i) as string;
						responseData = await this.makeApiRequest('GET', `https://api.frontapp.com/conversations/${convId}/comments`);
					} else if (operation === 'listMentions') {
						const commentId = this.getNodeParameter('commentId', i) as string;
						responseData = await this.makeApiRequest('GET', `https://api.frontapp.com/comments/${commentId}/mentions`);
					}
				}
				// --------------- CONVERSATIONS ---------------
				else if (resource === 'conversation') {
					if (operation === 'get') {
						const convId = this.getNodeParameter('conversationId', i) as string;
						responseData = await this.makeApiRequest('GET', `https://api.frontapp.com/conversations/${convId}`);
					} else if (operation === 'list') {
						const filter = this.getNodeParameter('convFilter', i) as string;
						let qs: IDataObject = {};
						if (filter) {
							qs = JSON.parse(filter);
						}
						responseData = await this.makeApiRequest('GET', 'https://api.frontapp.com/conversations', undefined, qs);
					} else if (operation === 'createDiscussion') {
						const subject = this.getNodeParameter('convSubject', i) as string;
						const convBody = this.getNodeParameter('convBody', i) as string;
						const requestBody = { subject, body: convBody, type: 'discussion' };
						responseData = await this.makeApiRequest('POST', 'https://api.frontapp.com/conversations', requestBody);
					} else if (operation === 'update') {
						const convId = this.getNodeParameter('conversationId', i) as string;
						const updateData = JSON.parse(this.getNodeParameter('convUpdateData', i) as string);
						responseData = await this.makeApiRequest('PATCH', `https://api.frontapp.com/conversations/${convId}`, updateData);
					} else if (operation === 'addFollowers') {
						const convId = this.getNodeParameter('conversationId', i) as string;
						const followers = (this.getNodeParameter('followerIds', i) as string)
							.split(',')
							.map(id => id.trim());
						const requestBody = { teammate_ids: followers };
						responseData = await this.makeApiRequest('POST', `https://api.frontapp.com/conversations/${convId}/followers`, requestBody);
					} else if (operation === 'removeFollowers') {
						const convId = this.getNodeParameter('conversationId', i) as string;
						const followers = (this.getNodeParameter('followerIds', i) as string)
							.split(',')
							.map(id => id.trim());
						const requestBody = { teammate_ids: followers };
						responseData = await this.makeApiRequest('DELETE', `https://api.frontapp.com/conversations/${convId}/followers`, requestBody);
					} else if (operation === 'addLinks') {
						const convId = this.getNodeParameter('conversationId', i) as string;
						const linkData = JSON.parse(this.getNodeParameter('linkData', i) as string);
						responseData = await this.makeApiRequest('POST', `https://api.frontapp.com/conversations/${convId}/links`, linkData);
					} else if (operation === 'removeLinks') {
						const convId = this.getNodeParameter('conversationId', i) as string;
						const linkData = JSON.parse(this.getNodeParameter('linkData', i) as string);
						responseData = await this.makeApiRequest('DELETE', `https://api.frontapp.com/conversations/${convId}/links`, linkData);
					} else if (operation === 'listMessages') {
						const convId = this.getNodeParameter('conversationId', i) as string;
						responseData = await this.makeApiRequest('GET', `https://api.frontapp.com/conversations/${convId}/messages`);
					} else if (operation === 'listEvents') {
						const convId = this.getNodeParameter('conversationId', i) as string;
						responseData = await this.makeApiRequest('GET', `https://api.frontapp.com/conversations/${convId}/events`);
					}
				}
				// ---------------- CONTACTS ----------------
				else if (resource === 'contact') {
					if (operation === 'list') {
						responseData = await this.makeApiRequest('GET', 'https://api.frontapp.com/contacts');
					} else if (operation === 'get') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						responseData = await this.makeApiRequest('GET', `https://api.frontapp.com/contacts/${contactId}`);
					} else if (operation === 'create') {
						const contactData = JSON.parse(this.getNodeParameter('contactData', i) as string);
						responseData = await this.makeApiRequest('POST', 'https://api.frontapp.com/contacts', contactData);
					} else if (operation === 'update') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						const contactData = JSON.parse(this.getNodeParameter('contactData', i) as string);
						responseData = await this.makeApiRequest('PATCH', `https://api.frontapp.com/contacts/${contactId}`, contactData);
					} else if (operation === 'delete') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						responseData = await this.makeApiRequest('DELETE', `https://api.frontapp.com/contacts/${contactId}`);
					} else if (operation === 'merge') {
						const mergeData = JSON.parse(this.getNodeParameter('mergeData', i) as string);
						responseData = await this.makeApiRequest('POST', 'https://api.frontapp.com/contacts/merge', mergeData);
					} else if (operation === 'addHandle') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						const handleData = JSON.parse(this.getNodeParameter('handleData', i) as string);
						responseData = await this.makeApiRequest('POST', `https://api.frontapp.com/contacts/${contactId}/handles`, handleData);
					} else if (operation === 'deleteHandle') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						const handleData = JSON.parse(this.getNodeParameter('handleData', i) as string);
						responseData = await this.makeApiRequest('DELETE', `https://api.frontapp.com/contacts/${contactId}/handles`, handleData);
					} else if (operation === 'getNotes') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						responseData = await this.makeApiRequest('GET', `https://api.frontapp.com/contacts/${contactId}/notes`);
					} else if (operation === 'addNote') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						const noteData = JSON.parse(this.getNodeParameter('noteData', i) as string);
						responseData = await this.makeApiRequest('POST', `https://api.frontapp.com/contacts/${contactId}/notes`, noteData);
					}
				}
				// ------------- CONTACT GROUPS -------------
				else if (resource === 'contactGroup') {
					if (operation === 'list') {
						responseData = await this.makeApiRequest('GET', 'https://api.frontapp.com/contact_groups');
					} else if (operation === 'create') {
						const groupData = JSON.parse(this.getNodeParameter('groupData', i) as string);
						responseData = await this.makeApiRequest('POST', 'https://api.frontapp.com/contact_groups', groupData);
					} else if (operation === 'delete') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						responseData = await this.makeApiRequest('DELETE', `https://api.frontapp.com/contact_groups/${groupId}`);
					} else if (operation === 'listContacts') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						responseData = await this.makeApiRequest('GET', `https://api.frontapp.com/contact_groups/${groupId}/contacts`);
					} else if (operation === 'addContacts') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const contactIds = (this.getNodeParameter('groupContactIds', i) as string)
							.split(',')
							.map(id => id.trim());
						const requestBody = { contact_ids: contactIds };
						responseData = await this.makeApiRequest('POST', `https://api.frontapp.com/contact_groups/${groupId}/contacts`, requestBody);
					} else if (operation === 'removeContacts') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const contactIds = (this.getNodeParameter('groupContactIds', i) as string)
							.split(',')
							.map(id => id.trim());
						const requestBody = { contact_ids: contactIds };
						responseData = await this.makeApiRequest('DELETE', `https://api.frontapp.com/contact_groups/${groupId}/contacts`, requestBody);
					}
				}
				// ----------------- MESSAGES -----------------
				else if (resource === 'message') {
					if (operation === 'get') {
						const messageId = this.getNodeParameter('messageId', i) as string;
						responseData = await this.makeApiRequest('GET', `https://api.frontapp.com/messages/${messageId}`);
					} else if (operation === 'getSource') {
						const messageId = this.getNodeParameter('messageId', i) as string;
						responseData = await this.makeApiRequest('GET', `https://api.frontapp.com/messages/${messageId}/source`);
					} else if (operation === 'send') {
						const channelId = this.getNodeParameter('channelId', i) as string;
						const to = this.getNodeParameter('messageTo', i) as string;
						const subject = this.getNodeParameter('messageSubject', i) as string;
						const msgBody = this.getNodeParameter('messageBody', i) as string;
						const requestBody = {
							author_id: '',
							subject,
							body: msgBody,
							to: to.split(',').map(item => item.trim()),
						};
						responseData = await this.makeApiRequest('POST', `https://api.frontapp.com/channels/${channelId}/messages`, requestBody);
					} else if (operation === 'sendReply') {
						const convId = this.getNodeParameter('conversationId', i) as string;
						const replyChannelId = this.getNodeParameter('replyChannelId', i) as string;
						const msgBody = this.getNodeParameter('messageBody', i) as string;
						const requestBody = { author_id: '', body: msgBody, channel_id: replyChannelId };
						responseData = await this.makeApiRequest('POST', `https://api.frontapp.com/conversations/${convId}/messages`, requestBody);
					} else if (operation === 'import') {
						const inboxId = this.getNodeParameter('inboxId', i) as string;
						const importData = JSON.parse(this.getNodeParameter('importMessageData', i) as string);
						responseData = await this.makeApiRequest('POST', `https://api.frontapp.com/inboxes/${inboxId}/messages`, importData);
					} else if (operation === 'receiveCustom') {
						const channelId = this.getNodeParameter('channelId', i) as string;
						const customData = JSON.parse(this.getNodeParameter('customMessageData', i) as string);
						responseData = await this.makeApiRequest('POST', `https://api.frontapp.com/channels/${channelId}/incoming_messages`, customData);
					} else if (operation === 'markSeen') {
						const messageId = this.getNodeParameter('messageId', i) as string;
						responseData = await this.makeApiRequest('POST', `https://api.frontapp.com/messages/${messageId}/mark_seen`);
					}
				}
				// ----------------- DRAFTS -----------------
				else if (resource === 'draft') {
					if (operation === 'create') {
						const convId = this.getNodeParameter('draftConversationId', i) as string;
						const draftData = JSON.parse(this.getNodeParameter('draftData', i) as string);
						responseData = await this.makeApiRequest('POST', `https://api.frontapp.com/conversations/${convId}/drafts`, draftData);
					} else if (operation === 'list') {
						const convId = this.getNodeParameter('draftConversationId', i) as string;
						responseData = await this.makeApiRequest('GET', `https://api.frontapp.com/conversations/${convId}/drafts`);
					} else if (operation === 'createReply') {
						const convId = this.getNodeParameter('draftConversationId', i) as string;
						const replyData = JSON.parse(this.getNodeParameter('draftReplyData', i) as string);
						responseData = await this.makeApiRequest('POST', `https://api.frontapp.com/conversations/${convId}/drafts`, replyData);
					} else if (operation === 'delete') {
						const draftId = this.getNodeParameter('draftId', i) as string;
						responseData = await this.makeApiRequest('DELETE', `https://api.frontapp.com/drafts/${draftId}`);
					} else if (operation === 'edit') {
						const draftId = this.getNodeParameter('draftId', i) as string;
						const editData = JSON.parse(this.getNodeParameter('draftEditData', i) as string);
						responseData = await this.makeApiRequest('PATCH', `https://api.frontapp.com/drafts/${draftId}`, editData);
					}
				}
				// ------------------ TAGS ------------------
				else if (resource === 'tag') {
					if (operation === 'list') {
						responseData = await this.makeApiRequest('GET', 'https://api.frontapp.com/tags');
					} else if (operation === 'get') {
						const tagId = this.getNodeParameter('tagId', i) as string;
						responseData = await this.makeApiRequest('GET', `https://api.frontapp.com/tags/${tagId}`);
					} else if (operation === 'create') {
						const tagData = JSON.parse(this.getNodeParameter('tagData', i) as string);
						responseData = await this.makeApiRequest('POST', 'https://api.frontapp.com/tags', tagData);
					} else if (operation === 'update') {
						const tagId = this.getNodeParameter('tagId', i) as string;
						const tagData = JSON.parse(this.getNodeParameter('tagData', i) as string);
						responseData = await this.makeApiRequest('PATCH', `https://api.frontapp.com/tags/${tagId}`, tagData);
					} else if (operation === 'delete') {
						const tagId = this.getNodeParameter('tagId', i) as string;
						responseData = await this.makeApiRequest('DELETE', `https://api.frontapp.com/tags/${tagId}`);
					} else if (operation === 'listConversations') {
						const tagId = this.getNodeParameter('tagId', i) as string;
						responseData = await this.makeApiRequest('GET', `https://api.frontapp.com/tags/${tagId}/conversations`);
					}
				} else {
					responseData = { error: `Resource "${resource}" not implemented` };
				}
				returnData.push(responseData.body || responseData);
			} catch (error) {
				returnData.push({ error: (error as Error).message });
			}
		}
		return [this.helpers.returnJsonArray(returnData)];
	}
}
