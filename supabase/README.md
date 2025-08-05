# Eduquinha - Supabase Database Setup

## 📋 Overview

This directory contains all the SQL scripts needed to set up the Eduquinha education CRM database in Supabase.

## 🗂️ Files

- `schema.sql` - Complete database schema with all tables and relationships
- `rls-policies.sql` - Row Level Security policies for data access control
- `sample-data.sql` - Sample data for testing (optional)

## 🚀 Setup Instructions

### 1. Access Supabase Dashboard

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Open your Eduquinha project

### 2. Execute Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `schema.sql`
3. Click **Run** to create all tables and relationships

### 3. Set Up Row Level Security

1. In the SQL Editor, copy and paste the contents of `rls-policies.sql`
2. Click **Run** to enable RLS and create all security policies

### 4. (Optional) Add Sample Data

1. **First**, create test users through Supabase Auth:
   - Go to **Authentication** > **Users**
   - Click **Add user** and create:
     - Admin: `admin@eduquinha.com`
     - Professor 1: `prof1@eduquinha.com`
     - Professor 2: `prof2@eduquinha.com`
     - Parent 1: `pai1@gmail.com`
     - Parent 2: `mae1@gmail.com`
     - Parent 3: `pai2@gmail.com`

2. **Then**, update `sample-data.sql`:
   - Replace `admin-uuid-here`, `prof1-uuid-here`, etc. with actual UUIDs from the users you created
   - Find the UUIDs in **Authentication** > **Users**

3. Execute the updated `sample-data.sql` in the SQL Editor

## 🔐 Security Features

### Row Level Security (RLS)

The database implements comprehensive RLS policies:

- **Admins**: Full access to all data
- **Professores**: Access to their classes and students only
- **Responsáveis**: Access to their children's data only

### User Roles

The system supports three user roles:

1. **admin** - School administrators
2. **professor** - Teachers
3. **responsavel** - Parents/guardians

## 📊 Database Structure

### Core Tables

- `profiles` - Extended user information with roles
- `turmas` - Classes/classrooms
- `alunos` - Students
- `aluno_responsavel` - Parent-child relationships

### Educational Data

- `rotinas` - Daily routines (feeding, sleep, mood)
- `presenca` - Attendance tracking
- `fotos` - Photo uploads

### Communication

- `comunicados` - School announcements
- `mensagens` - Direct messages between teachers and parents
- `eventos` - School events and activities

### Financial

- `financeiro` - Payment tracking and billing

## 🔧 Storage Setup

### Photo Storage

1. In Supabase dashboard, go to **Storage**
2. Create a new bucket called `fotos`
3. Set up policies for photo access based on user roles

### Bucket Policies Example

```sql
-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'fotos' AND auth.role() = 'authenticated');

-- Users can view photos based on RLS from fotos table
CREATE POLICY "Users can view allowed photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'fotos' AND auth.role() = 'authenticated');
```

## ✅ Verification

After setup, verify everything works:

1. **Test Authentication**: Try logging in with different user roles
2. **Test Permissions**: Ensure users only see their authorized data
3. **Test Relationships**: Verify parent-child and teacher-student relationships
4. **Test Real-time**: Check if real-time updates work for messages

## 🆘 Troubleshooting

### Common Issues

1. **"relation does not exist" errors**: Make sure you ran `schema.sql` first
2. **Permission denied errors**: Check if RLS policies are properly configured
3. **Foreign key violations**: Ensure proper relationships between tables

### Support

If you encounter issues:

1. Check Supabase dashboard logs
2. Verify all tables were created successfully
3. Confirm RLS policies are enabled
4. Test with sample data to isolate issues

## 📝 Notes

- All timestamps use UTC timezone
- The system supports Portuguese language content
- Phone numbers use Brazilian format
- Currency values are in Brazilian Real (BRL)