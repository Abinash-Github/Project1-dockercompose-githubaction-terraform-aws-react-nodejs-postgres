output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.app.id
}

output "ec2_public_ip" {
  description = "Public IP address of EC2 instance"
  value       = aws_eip.app.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS name of EC2 instance"
  value       = aws_instance.app.public_dns
}

output "ssh_command" {
  description = "SSH command to connect to instance"
  value       = "ssh -i .ssh/${var.ssh_key_name}.pem -o StrictHostKeyChecking=no ec2-user@${aws_eip.app.public_ip}"
}

output "frontend_url" {
  description = "Frontend application URL"
  value       = "http://${aws_eip.app.public_ip}:${var.app_port_frontend}"
}

output "backend_url" {
  description = "Backend API URL"
  value       = "http://${aws_eip.app.public_ip}:${var.app_port_backend}"
}

output "ssh_key_path" {
  description = "Path to SSH private key"
  value       = local_file.private_key.filename
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "subnet_id" {
  description = "Public subnet ID"
  value       = aws_subnet.public.id
}

output "security_group_id" {
  description = "Security group ID"
  value       = aws_security_group.app.id
}

output "terraform_outputs_summary" {
  description = "Summary of important outputs"
  value = {
    public_ip              = aws_eip.app.public_ip
    ssh_command            = "ssh -i .ssh/${var.ssh_key_name}.pem -o StrictHostKeyChecking=no ec2-user@${aws_eip.app.public_ip}"
    app_frontend_endpoint  = "http://${aws_eip.app.public_ip}:${var.app_port_frontend}"
    app_backend_endpoint   = "http://${aws_eip.app.public_ip}:${var.app_port_backend}"
    ssh_key_saved_at       = local_file.private_key.filename
  }
}
