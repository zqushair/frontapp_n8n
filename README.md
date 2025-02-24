# frontapp_n8n
FrontApp n8n Node

• Create, get, update, list conversation comments, and list comment mentions are implemented.
Conversations:

• Get, list (with optional filtering via a JSON string), create discussion (by posting with type "discussion"), update (by passing a JSON object), add/remove followers, add/remove links, list messages, and list events are added.
Contacts:

• List, get, create, update, delete, merge contacts, add/delete contact handles, and get/add contact notes.
Contact Groups:

• List groups, create, delete, list contacts in a group, and add/remove contacts from a group.
Messages:

• Get a message (and its source), send a new message, send a reply, import a message, receive a custom message, and mark a message as seen.
Drafts:

• Create a draft (or draft reply), list drafts for a conversation, delete a draft, and edit a draft.
Tags:

• List tags, get, create, update, delete a tag, and list conversations by tag.

Each operation uses Frontapp’s public API endpoints with HTTP methods and request bodies as needed.
