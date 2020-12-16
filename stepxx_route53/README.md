# Introduction
## What is DNS?
he Domain Name System (DNS) is a global infrastructure that translates human-readable hostnames into IP addresses. Organizations using Amazon Web Services (AWS) are running machines in the cloud, and need a mechanism to translate user requests into the correct Amazon IP address.

On the cloud, IP addresses can frequently change, as services move between physical machines and data centers. An AWS DNS solution must be able to adapt to these changes and propagate them quickly to DNS clients. Amazon’s official DNS solution is called Route 53.
## What is Route 53?
Route 53 is a managed DNS service from Amazon Web Services, intended for managing DNS for machines and services deployed on Amazon’s public cloud. Route 53 connects user requests to infrastructure running on AWS, such as Amazon EC2 instances, ELB load balancers or Amazon S3 buckets.
## Route 53 Key Features
- Traffic flow—routes end users to the endpoint that should provide the best user experience
- Latency-based routing—routes users to the AWS region that provides the lowest latency
- Health checks—monitors health and performance of applications
- Private DNS—for users of Amazon VPC, defines custom domain names without exposing DNS information publicly
#### Reference
[AWS DNS—Route 53 Features, Pricing and Limitations](https://ns1.com/resources/aws-dns?ns1_gad&utm_medium=ppc&utm_campaign=KB_DSA_Miner&utm_source=adwords&utm_term=&hsa_net=adwords&hsa_acc=2820460118&hsa_mt=b&hsa_ad=460843015360&hsa_src=g&hsa_ver=3&hsa_cam=1455218152&hsa_grp=116479372748&hsa_tgt=dsa-19959388920&hsa_kw=&gclid=CjwKCAiA_eb-BRB2EiwAGBnXXvQDAkWJp_6pkLy_6y6nySt-iJsPsXYAEpx6XscmfHcnlQlMBrQqsBoClaQQAvD_BwE) 

## Hosted zone
A hosted zone is a container for records, and records contain information about how you want to route traffic for a specific domain, such as example.com, and its subdomains (acme.example.com, zenith.example.com). A hosted zone and the corresponding domain have the same name. There are two types of hosted zones.
- Public hosted zones contain records that specify how you want to route traffic on the internet.
- Private hosted zones contain records that specify how you want to route traffic in an Amazon VPC. 

#### Reference
[Working with hosted zones](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/hosted-zones-working-with.html)


## Nameserver
Nameserver is a server on the Internet specialized in handling queries regarding the location of the domain name's various services. In easy words, name servers define your domain's current DNS provider. All domains usually have at least two DNS servers which can be checked via Whois lookup tool.


### Note
- **Route 53** is a Paid service. Check Route 53 [Pricing](https://aws.amazon.com/route53/pricing/)

## Resources
[AWS Route53 — Records & Routing Policies](https://medium.com/@kumargaurav1247/aws-route53-records-routing-policies-f3657b01ffa2)