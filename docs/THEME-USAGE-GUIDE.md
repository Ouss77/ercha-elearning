# Theme Usage Guide

Quick reference for using the new teal/turquoise theme in your components.

## Color Reference

### Primary Colors
```tsx
// Primary teal - main brand color
className="bg-primary text-primary-foreground"
className="text-primary"
className="border-primary"

// Primary with opacity
className="bg-primary/10"  // 10% opacity background
className="bg-primary/20"  // 20% opacity background
className="text-primary/80" // 80% opacity text

// Purple accent (chart-2)
className="bg-chart-2 text-white"
className="text-chart-2"
className="border-chart-2"
```

### Button Styles
```tsx
// Primary button (recommended for main actions)
<Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
  Action
</Button>

// Outline button
<Button variant="outline" className="border-2 hover:bg-accent">
  Secondary Action
</Button>

// Ghost button
<Button variant="ghost" className="hover:bg-primary/10">
  Tertiary Action
</Button>
```

### Card Styles
```tsx
// Standard card
<Card className="border-border/50 bg-card">
  <CardContent>...</CardContent>
</Card>

// Hover effect card
<Card className="border-border/50 bg-card hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
  <CardContent>...</CardContent>
</Card>

// Card with gradient accent
<Card className="border-border/50 bg-card overflow-hidden">
  <div className="h-2 bg-gradient-to-r from-primary to-chart-2"></div>
  <CardContent>...</CardContent>
</Card>

// Glass morphism card
<Card className="border-border/50 bg-card/80 backdrop-blur-sm">
  <CardContent>...</CardContent>
</Card>
```

### Gradient Patterns
```tsx
// Logo/Icon backgrounds
<div className="h-10 w-10 bg-gradient-to-br from-primary to-chart-2 rounded-lg flex items-center justify-center">
  <Icon className="h-6 w-6 text-white" />
</div>

// Section backgrounds
<section className="bg-gradient-to-br from-background via-accent/10 to-primary/5">
  {/* Content */}
</section>

// Gradient text
<h1 className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
  Gradient Heading
</h1>

// Subtle foreground gradient
<span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
  Subtle Text
</span>
```

### Badge Styles
```tsx
// Primary badge
<Badge className="bg-primary/10 text-primary border border-primary/20">
  Badge
</Badge>

// Role-specific badges
<Badge className="bg-chart-2/10 text-chart-2 border border-chart-2/20">
  Student
</Badge>

<Badge className="bg-chart-4/10 text-chart-4 border border-chart-4/20">
  Sub-Admin
</Badge>

<Badge className="bg-destructive/10 text-destructive border border-destructive/20">
  Admin
</Badge>
```

### Shadow Effects
```tsx
// Subtle shadow
className="shadow-md shadow-primary/20"

// Medium shadow
className="shadow-lg shadow-primary/25"

// Strong shadow
className="shadow-xl shadow-primary/30"

// Hover shadow
className="hover:shadow-xl hover:shadow-primary/10 transition-all"
```

### Backgrounds with Decorative Elements
```tsx
<div className="relative overflow-hidden">
  {/* Decorative circles */}
  <div className="absolute top-10 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
  <div className="absolute bottom-10 left-10 w-96 h-96 bg-chart-2/10 rounded-full blur-3xl"></div>
  
  {/* Content */}
  <div className="relative z-10">
    {/* Your content here */}
  </div>
</div>
```

### Input Fields
```tsx
// Standard input (uses theme automatically)
<Input 
  type="text" 
  placeholder="Enter text..."
  className="focus:ring-primary"
/>

// Error state
<Input 
  type="text" 
  className="border-destructive"
/>
```

### Progress Indicators
```tsx
// Progress bar (uses primary color)
<Progress value={65} className="h-2" />

// Custom color progress
<Progress 
  value={65} 
  className="h-2 [&>div]:bg-chart-2" 
/>
```

### Avatar Styles
```tsx
// Avatar with ring
<Avatar className="h-9 w-9 ring-2 ring-primary/20">
  <AvatarImage src={user.image} />
  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-chart-2/20 text-primary font-semibold">
    {initials}
  </AvatarFallback>
</Avatar>
```

### Navigation Items
```tsx
// Active state
<Link 
  href="/path"
  className="bg-gradient-to-r from-primary/10 to-chart-2/10 text-primary border-l-4 border-primary"
>
  Active Link
</Link>

// Hover state
<Link 
  href="/path"
  className="text-foreground hover:bg-accent hover:text-primary hover:translate-x-1 transition-all"
>
  Link
</Link>
```

### Alert/Notification Styles
```tsx
// Info alert
<Alert className="border-primary/20 bg-primary/5">
  <AlertDescription className="text-foreground">
    Info message
  </AlertDescription>
</Alert>

// Success
<Alert className="border-chart-3/20 bg-chart-3/5">
  <AlertDescription className="text-foreground">
    Success message
  </AlertDescription>
</Alert>
```

### Loading States
```tsx
// Loading button
<Button disabled className="bg-primary/50">
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>
```

### Hover Animations
```tsx
// Scale on hover
className="group"
// On child:
className="group-hover:scale-105 transition-transform duration-300"

// Translate on hover
className="hover:translate-x-1 transition-transform"

// Icon scale
className="group-hover:scale-110 transition-transform"
```

### Stats/Metric Cards
```tsx
<Card className="border-border/50 bg-card">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
    <Users className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold text-foreground">2,543</div>
    <p className="text-xs text-muted-foreground">+12% from last month</p>
  </CardContent>
</Card>
```

### Icon Containers
```tsx
// Small icon container
<div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
  <Icon className="h-4 w-4 text-primary" />
</div>

// Medium icon container
<div className="h-12 w-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
  <Icon className="h-6 w-6 text-primary" />
</div>

// Large icon container
<div className="h-16 w-16 bg-gradient-to-br from-primary to-chart-2 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
  <Icon className="h-10 w-10 text-white" />
</div>
```

## Common Patterns

### Feature Card
```tsx
<Card className="border-border/50 bg-card hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group overflow-hidden">
  <div className="h-2 bg-gradient-to-r from-primary to-chart-2"></div>
  <CardHeader>
    <div className="h-12 w-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      <BookOpen className="h-6 w-6 text-primary" />
    </div>
    <CardTitle className="text-xl">Feature Title</CardTitle>
    <CardDescription className="text-base">
      Feature description text
    </CardDescription>
  </CardHeader>
</Card>
```

### Page Header
```tsx
<div className="mb-8">
  <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
    Section Badge
  </span>
  <h1 className="text-3xl md:text-4xl font-bold mt-6 mb-4 text-foreground">
    Page Title
  </h1>
  <p className="text-muted-foreground max-w-2xl">
    Page description
  </p>
</div>
```

## Tips

1. **Use opacity modifiers** for subtle backgrounds: `/10`, `/20`, `/30`
2. **Combine gradients** with `from-primary to-chart-2` for visual interest
3. **Add transitions** to interactive elements: `transition-all duration-300`
4. **Use backdrop-blur** for modern glass effects: `backdrop-blur-sm`
5. **Layer shadows** with primary color opacity for depth
6. **Ring borders** on avatars: `ring-2 ring-primary/20`
7. **Border opacity** for subtle separation: `border-border/50`

## Dark Mode Considerations

The theme automatically adjusts for dark mode. To test:
1. System dark mode will trigger automatically
2. Colors become slightly more saturated in dark mode
3. Backgrounds shift to navy tones
4. Primary color becomes brighter for better contrast

No additional dark mode classes needed - the CSS variables handle everything!
