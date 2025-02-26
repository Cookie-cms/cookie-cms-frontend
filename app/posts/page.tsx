"use client";
import React from 'react';
import { useState, useEffect } from "react";

import { ChevronLeft, Calendar, User, MessageSquare, Share2, Heart, Bookmark, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

export default function BlogPost() {
  
  // Sample post data - in a real app, you would fetch this based on the post ID
  const post = {
    id: 1,
    title: "Getting Started with CookieCMS: A Complete Guide",
    banner: "/api/placeholder/1200/400", // Banner image URL
    readTime: 8, // Estimated read time in minutes
    content: `
      <p>CookieCMS provides a powerful yet simple way to manage your Minecraft community. In this guide, we'll walk through the essential features and how to make the most of them.</p>
      
      <h2>Setting Up Your Server</h2>
      <p>The first step is connecting your Minecraft server to CookieCMS. This allows for seamless integration between your website and game servers.</p>
      
      <pre><code>
      servers:
        name: Survival
        ip: play.example.com
        port: 25565
      </code></pre>
      
      <p>Once connected, players can see server status directly on your website and interact with various features that bridge the web and game experience.</p>
      
      <h2>Managing User Accounts</h2>
      <p>CookieCMS offers robust user management with role-based permissions. This means you can give different access levels to staff, VIP players, and regular members.</p>
      
      <p>The permissions system is flexible enough to create custom roles for your specific community needs. Whether you need moderators who can manage forum posts but not server settings, or VIP members who can access premium skins, CookieCMS has you covered.</p>
      
      <h2>Customizing Your Site</h2>
      <p>Your community deserves a unique look and feel. CookieCMS themes can be fully customized to match your server's branding and style.</p>
      
      <p>The template system uses modern web standards, making it easy for anyone with basic HTML and CSS knowledge to create stunning designs.</p>
      
      <h2>Next Steps</h2>
      <p>Now that you understand the basics, explore the admin dashboard to discover more features like:</p>
      <ul>
        <li>Custom skin uploads</li>
        <li>Forum integration</li>
        <li>Shop and donation management</li>
        <li>Server statistics and analytics</li>
      </ul>
      
      <p>Stay tuned for more tutorials on making the most of your CookieCMS installation!</p>
    `,
    publishedAt: "2025-02-15T10:30:00Z",
    author: {
      name: "Admin",
      avatar: "/api/placeholder/40/40",
      role: "Administrator"
    },
    categories: ["Tutorials", "Getting Started"],
    tags: ["guide", "setup", "beginners"],
    commentCount: 12,
    likeCount: 47,
    isBookmarked: false
  };
  
  // Format date
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    const updateReadProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const readProgress = scrollTop / docHeight * 100;
      
      // Update progress bar width
      const progressBars = document.querySelectorAll('.progress-bar');
      progressBars.forEach(bar => {
        bar.style.width = `${readProgress}%`;
      });
    };
    
    window.addEventListener('scroll', updateReadProgress);
    return () => window.removeEventListener('scroll', updateReadProgress);
  }, []);
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Back button */}
      <Button 
        variant="ghost" 
        className="mb-6 pl-0" 
        // onClick={() => router.back()}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Blog
      </Button>
      
      {/* Banner Image */}
      <div className="relative w-full h-64 md:h-80 mb-8 rounded-lg overflow-hidden">
        <img 
          src={post.banner} 
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
          <div className="absolute bottom-0 left-0 p-6">
            <div className="flex flex-wrap gap-2 mb-2">
              {post.categories.map(category => (
                <Badge key={category} variant="secondary" className="bg-primary text-primary-foreground">
                  {category}
                </Badge>
              ))}
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{post.title}</h1>
          </div>
        </div>
      </div>
      
      {/* Post metadata */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <Calendar className="mr-1 h-4 w-4" />
            {formattedDate}
          </div>
          
          <div className="flex items-center">
            <User className="mr-1 h-4 w-4" />
            {post.author.name}
          </div>
          
          <div className="flex items-center">
            <MessageSquare className="mr-1 h-4 w-4" />
            {post.commentCount} comments
          </div>
          
          {/* Read time */}
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            {post.readTime} min read
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Heart className="mr-1 h-4 w-4" />
            {post.likeCount}
          </Button>
          <Button variant="ghost" size="sm">
            <Bookmark className="mr-1 h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Author card with read time progress */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-4">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{post.author.name}</div>
                <div className="text-sm text-muted-foreground">{post.author.role}</div>
              </div>
            </div>
            
            {/* Sticky read progress bar for desktop */}
            <div className="hidden md:flex items-center">
              <span className="text-sm font-medium mr-2">{post.readTime} min read</span>
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: '0%' }} // This would be controlled by JS to show reading progress
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Post content */}
      <div 
        className="prose prose-blue max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {post.tags.map(tag => (
          <Badge key={tag} variant="outline">
            #{tag}
          </Badge>
        ))}
      </div>
      
      <Separator className="my-8" />
      
      {/* Action buttons */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Heart className="mr-2 h-4 w-4" />
            Like ({post.likeCount})
          </Button>
          <Button variant="outline" size="sm">
            <Bookmark className="mr-2 h-4 w-4" />
            {post.isBookmarked ? 'Saved' : 'Save'}
          </Button>
        </div>
        
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
      
      {/* Comments section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Comments ({post.commentCount})</h2>
        
        {/* Comment form */}
        <div className="mb-8">
          <textarea
            className="w-full p-4 border rounded-lg resize-none min-h-32 mb-2"
            placeholder="Leave a comment..."
          ></textarea>
          <Button>Post Comment</Button>
        </div>
        
        {/* Sample comments */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="mt-1">
                  <AvatarImage src="/api/placeholder/40/40" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <div className="font-medium">User123</div>
                    <div className="text-sm text-muted-foreground">Yesterday</div>
                  </div>
                  <p>This guide was really helpful! I've been struggling with setting up my server but now I understand how everything works together.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="mt-1">
                  <AvatarImage src="/api/placeholder/40/40" />
                  <AvatarFallback>M</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <div className="font-medium">Moderator</div>
                    <div className="text-sm text-muted-foreground">2 days ago</div>
                  </div>
                  <p>Great post! I'd also recommend checking out the advanced permissions tutorial for more detailed configuration options.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Button variant="outline" className="w-full">Load More Comments</Button>
        </div>
      </div>
      
      {/* Sticky read progress bar for mobile (fixed at bottom) */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-background border-t p-2">
        <div className="container mx-auto flex items-center justify-between">
          <span className="text-sm font-medium">
            <Clock className="inline mr-1 h-4 w-4" />
            {post.readTime} min read
          </span>
          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full" 
              style={{ width: '0%' }} // This would be controlled by JS to show reading progress
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// In a real implementation, you would add JavaScript to track scroll position
// and update the progress bar accordingly. Here's a simplified example of what that might look like:
/*
  useEffect(() => {
    const updateReadProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const readProgress = scrollTop / docHeight * 100;
      
      // Update progress bar width
      const progressBars = document.querySelectorAll('.progress-bar');
      progressBars.forEach(bar => {
        bar.style.width = `${readProgress}%`;
      });
    };
    
    window.addEventListener('scroll', updateReadProgress);
    return () => window.removeEventListener('scroll', updateReadProgress);
  }, []);
*/