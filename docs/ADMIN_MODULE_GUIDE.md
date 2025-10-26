# Admin Guide: Module Management

**E-Learning Platform** | Module-Based Course Structure

---

## Overview

As an administrator, you can now organize course content using a **modular structure**. Modules act as containers that group related chapters together, making courses more organized and easier to navigate for students.

### Course Hierarchy

```
Course
  └─ Module (e.g., "HTML Fundamentals")
      ├─ Chapter 1: "Introduction to HTML"
      ├─ Chapter 2: "HTML Document Structure"
      └─ Chapter 3: "Semantic HTML"
```

---

## Getting Started

### Access Module Management

1. **Login** as an administrator at `/connexion`
2. Navigate to **Admin Dashboard** at `/admin`
3. Click on **Courses** in the sidebar
4. Select a course to manage
5. Click on **Modules** tab to manage modules

---

## Creating Modules

### Step 1: Navigate to Module Management

1. Go to **Admin → Courses → [Select Course] → Modules**
2. Click the **"Create New Module"** button

### Step 2: Fill Module Details

| Field | Description | Required |
|-------|-------------|----------|
| **Title** | Module name (3-200 characters) | ✅ Yes |
| **Description** | Brief overview of module content (max 1000 chars) | ❌ Optional |

### Step 3: Save Module

- Click **"Create Module"** to save
- The new module will appear in the list with order index automatically assigned

**Example Module**:
```
Title: JavaScript Fundamentals
Description: Learn the core concepts of JavaScript including variables, 
functions, and control flow.
```

---

## Managing Chapters Within Modules

### Creating Chapters

1. **Expand** a module by clicking on it
2. Click **"Add Chapter"** button within the module card
3. Fill in chapter details:
   - **Title**: Chapter name
   - **Description**: Chapter overview
4. Click **"Create Chapter"**

The chapter will be added to the selected module.

### Moving Chapters Between Modules

If you need to reorganize chapters:

1. Click the **"Move"** icon on a chapter card
2. Select the **target module** from the dropdown
3. (Optional) Choose the position in the target module
4. Click **"Move Chapter"**

The chapter will be moved with its content and student progress intact.

### Reordering Chapters Within a Module

1. **Expand** the module containing chapters
2. **Drag and drop** chapters to reorder them
3. Changes are saved automatically

---

## Reordering Modules

Modules can be reordered within a course using drag-and-drop:

1. Navigate to the course's **Modules** page
2. Click and **drag** a module by the handle icon (⋮⋮)
3. **Drop** it in the desired position
4. Changes are saved automatically

---

## Deleting Modules

⚠️ **Warning**: Deleting a module will also delete all chapters within it and remove associated student progress.

### Steps to Delete

1. Click the **Delete** icon (🗑️) on a module card
2. A confirmation dialog will appear showing:
   - Number of chapters in the module
   - Warning about cascade deletion
3. Type **"DELETE"** to confirm
4. Click **"Confirm Deletion"**

**What happens**:
- ✅ Module is permanently deleted
- ✅ All chapters in the module are deleted
- ✅ Student progress for those chapters is removed
- ✅ Database referential integrity is maintained

---

## Deleting Chapters

Deleting a chapter removes its content and student progress:

1. **Expand** the module containing the chapter
2. Click the **Delete** icon on a chapter card
3. Confirm the deletion

---

## Best Practices

### Module Organization

✅ **DO**:
- Group related chapters into logical modules
- Use descriptive module titles (e.g., "HTML Fundamentals" not "Module 1")
- Include helpful descriptions to guide students
- Keep modules focused on a single topic or skill

❌ **DON'T**:
- Create too many modules (5-10 is ideal per course)
- Use generic names like "Part 1", "Part 2"
- Leave descriptions empty
- Mix unrelated topics in one module

### Chapter Structure

✅ **DO**:
- Order chapters from basic to advanced
- Keep chapters bite-sized (10-15 minutes each)
- Use clear, descriptive chapter titles
- Test the learning flow yourself

❌ **DON'T**:
- Create overly long chapters
- Skip prerequisite content
- Assume prior knowledge

### Content Workflow

1. **Plan** the course structure (modules and chapters)
2. **Create** modules first
3. **Add** chapters to modules
4. **Upload** content to chapters
5. **Review** and test the course flow
6. **Activate** the course for students

---

## Viewing Module Progress (Teachers)

Teachers can view module-level progress for their courses:

1. Navigate to **Teacher Dashboard** → **My Courses**
2. Select a course
3. Click on **Module Progress** tab
4. View statistics:
   - Students enrolled
   - Completion rate per module
   - Individual student progress

---

## Student Experience

Students will see the modular structure when viewing courses:

```
Course: Introduction to Web Development
  ├─ Module 1: HTML Fundamentals (Progress: 60%)
  │   ├─ Chapter 1: Introduction ✅
  │   ├─ Chapter 2: Structure ✅
  │   └─ Chapter 3: Semantic ⏳
  ├─ Module 2: CSS Styling (Progress: 0%)
  │   └─ ...
  └─ Module 3: JavaScript Basics (Progress: 0%)
      └─ ...
```

- ✅ Completed chapters show a checkmark
- ⏳ Current chapter is highlighted
- Progress percentage shows module completion

---

## Troubleshooting

### "Cannot delete module: contains chapters"

This is expected behavior. You have two options:

1. **Delete chapters first**, then delete the module
2. **Confirm cascade deletion** to delete module and all chapters together

### "Module not found" error

- Refresh the page
- Ensure you're selecting a valid course
- Check your admin permissions

### Changes not saving

- Check your internet connection
- Verify no console errors (press F12)
- Try refreshing the page
- Contact technical support if issue persists

---

## Permissions

**ADMIN Role**:
- ✅ Create, edit, delete modules
- ✅ Create, edit, delete chapters
- ✅ Move chapters between modules
- ✅ Reorder modules and chapters
- ✅ View all courses

**TRAINER Role**:
- ❌ Cannot create or modify modules
- ❌ Cannot create or modify chapters
- ✅ Can view course content
- ✅ Can view student progress
- ✅ Can grade assignments

**STUDENT Role**:
- ✅ View enrolled courses with modules
- ✅ Complete chapters and track progress
- ❌ Cannot modify course content

---

## FAQ

**Q: Can I convert existing courses to modular structure?**  
A: Yes! A migration script has already converted all existing courses. Old chapters are now in a "Main Content" module.

**Q: What happens to student progress when I reorganize modules?**  
A: Student progress is tied to chapters, not modules. Moving chapters preserves all progress data.

**Q: Can students see empty modules?**  
A: Yes, but they cannot access chapters. It's recommended to add content before publishing.

**Q: How many modules should I create per course?**  
A: 5-10 modules is ideal. Too few makes courses feel unstructured; too many can be overwhelming.

**Q: Can I duplicate modules?**  
A: Not yet, but it's on the roadmap. For now, manually create similar modules.

---

## Additional Resources

- [Database Schema Documentation](../specs/001-course-modules-layer/data-model.md)
- [API Documentation](../specs/001-course-modules-layer/contracts/)
- [Quickstart Guide](../specs/001-course-modules-layer/quickstart.md)
- [Technical Specification](../specs/001-course-modules-layer/spec.md)

---

## Support

For technical issues or questions:

- **Technical Support**: admin@example.com
- **Bug Reports**: GitHub Issues
- **Feature Requests**: Contact product team

---

**Last Updated**: October 24, 2025  
**Version**: 1.0.0 (Module Layer)
