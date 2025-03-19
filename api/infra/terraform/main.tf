# Terraform
terraform {
    required_providers {
        aws = {
            version = ">= 4.0.0"
            source  = "hashicorp/aws"
        }
    }
}
# Region
provider "aws" {
    region = "us-west-2"
}
# Tags
locals {
    common_tags = {
        Project = "ENSF-401-Final-Project"
        Name    = "Carlens API"
    }
}

resource "aws_vpc" "vpc" {
    cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "subnet" {
    vpc_id = aws_vpc.vpc.id
    cidr_block = "10.0.1.0/24"
    map_public_ip_on_launch = true
}

resource "aws_internet_gateway" "internet-gateway" {
    vpc_id = aws_vpc.vpc.id
}

resource "aws_route_table" "route-table" {
    vpc_id = aws_vpc.vpc.id
}

resource "aws_route" "route" {
    route_table_id = aws_route_table.route-table.id
    destination_cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.internet-gateway.id
}

resource "aws_route_table_association" "rt-association" {
    subnet_id = aws_subnet.subnet.id
    route_table_id = aws_route_table.route-table.id
}

resource "aws_security_group" "ec2-sg" {
  vpc_id = aws_vpc.vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

    ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_key_pair" "key-pair" {
    key_name = "carlens-ec2"
    public_key = file("~/.ssh/carlens-ec2.pub")
}

resource "aws_instance" "carlens-ec2-t2-micro" {
    
    ami = "ami-0b6d6dacf350ebc82"
    instance_type = "t2.micro"
    subnet_id = aws_subnet.subnet.id
    vpc_security_group_ids = [aws_security_group.ec2-sg.id]
    key_name = aws_key_pair.key-pair.key_name

    tags = local.common_tags
}