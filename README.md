### Locus.news

A platform build on three ideas:
- Taxonomy of topics
- Reusability of content
- Community curation

Value for the user (what problem are we solving):
- Explorative experience - news are unkown unkowns, by creating a taxonomy of topics we provide users with a balance between general overview of news and a tool to dive deeper into topics
- Collaboration - the taxonomy of topics and social media environment will srpout niche communities that share news about the world and have the ability to collaborate that way

Platform details:
- Channels - taxonomy of topics
- Posts - user created or mined from other platforms
- Chats - a place to collaborate and interact with the content
- Promotion - based on user interactions engaging posts will get promoted to more general channels

Extention:
- Streaming
- User competence

Systems:
- API
  - We need an API to provide a starting point for data injection
  - API safety + user privileges
  - API testing - postman, NodeJS scripts
- Front-end
  - NextJS for static side generation and SEO
  - overly simplistic design
- Content mining
  - A cluster of workers that take workloads from a queue
  - Workloads represent an activity of mining content from other platforms
  
