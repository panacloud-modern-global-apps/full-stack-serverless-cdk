# Graph Databases, AWS Nepture, Open Cypher, and Ghaph Query Language (GQL)

[Why developers should use graph databases](https://www.infoworld.com/article/3567771/why-developers-should-use-graph-databases.html)

Here’s how the query in Cypher for extracting friends and friends of friends looks:

MATCH (me:Person {name:'Rosa'})-[:FRIEND*1..2]->(f:Person)

WHERE me <> f

RETURN f

Here’s how to understand this query:

1. Find me the pattern where there is a node with label Person and a property name:'Rosa’, and bind that to the variable “me.” The query specifies that “me” has an outgoing FRIEND relationship at depth 1 or 2 to any other node with a Person label, and binds those matches to variable “f.”
2. Make sure “me” is not equal “f,” because I’m a friend of my friends!
3. Return all the friends and friends of friends

## Overview

[What is a graph database?](https://venturebeat.com/2021/02/08/what-is-a-graph-database/)

[What are graph database query languages?](https://venturebeat.com/2021/09/03/what-are-graph-database-query-languages/)

[Amazon Neptune now supports the openCypher query language](https://aws.amazon.com/about-aws/whats-new/2021/07/amazon-neptune-supports-opencypher/)

[Graph databases must meet developers and business analysts on their own turf](https://www.zdnet.com/article/graph-databases-must-meet-developers-and-business-analysts-on-their-own-turf/)

## Learning openCypher

[Cypher Query Language Developer Guide](https://neo4j.com/developer/cypher/)

[Cyper Sandbox](https://neo4j.com/sandbox/)

[Developer Manual](https://neo4j.com/docs/cypher-manual/current/)

[Download Graph Databases For Dummies Book](https://neo4j.com/graph-databases-for-dummies/)

[Getting Started with Cypher](https://neo4j.com/developer/cypher/intro-cypher/)

[Cypher Query Language Reference, Version 9](https://s3.amazonaws.com/artifacts.opencypher.org/openCypher9.pdf)

[Cyper Reference Card](https://neo4j.com/docs/cypher-refcard/current/)


## AWS Neptune with openCypher

[Accessing the Neptune Graph with openCypher](https://docs.aws.amazon.com/neptune/latest/userguide/access-graph-opencypher.html)

[Overview of the openCypher query language in Amazon Neptune](https://docs.aws.amazon.com/neptune/latest/userguide/access-graph-opencypher-overview.html)


## GQL Standard

[Graph Query Language](https://en.wikipedia.org/wiki/Graph_Query_Language)

[Alastair Green on GQL : the Graph Query Language - The Graph Show](https://www.youtube.com/watch?v=2sLTQQel4NM)

[GQL Standard](https://www.gqlstandards.org/home)

[First GQL research implementation](https://www.linkedin.com/pulse/first-gql-research-implementation-from-olof-morra-tu-eindhoven-green/)

[Implementation Repo](https://github.com/OlofMorra/GQL-parser)

[LDBC Council on Twitter](https://twitter.com/LDBCouncil)

[The Graph Show on Twitter](https://twitter.com/TheGraphShow)


## Property Graphs need a Schema

[Property Graphs need a Schema](https://www.w3.org/Data/events/data-ws-2019/assets/position/Juan%20Sequeda.txt)


