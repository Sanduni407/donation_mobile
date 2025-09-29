import { AppwriteID, databases, storage } from './appwrite';

const DATABASE_ID = '68d797e8002551ac5a86';
const COMMUNITY_POSTS_TABLE_ID = 'communityposts';
const REACTIONS_TABLE_ID = 'reactions';
const COMMENTS_TABLE_ID = 'comments';
const BUCKET_ID = '68d79ed4003b71ab46cd';

export interface CommunityPost {
  $id: string;
  volunteerId: string;
  volunteerName: string;
  caption: string;
  eventTitle: string;
  description: string;
  imageUrl?: string;
  date: string;
  time: string;
  venue: string;
  categories: string[];
  createdAt: string;
  updatedAt: string;
  reactionCount?: number;
  commentCount?: number;
  hasUserReacted?: boolean;
}

export interface Reaction {
  $id: string;
  postId: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface Comment {
  $id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export type CommunityPostData = {
  volunteerId: string;
  volunteerName: string;
  caption: string;
  eventTitle: string;
  description: string;
  imageUrl?: string;
  date: string;
  time: string;
  venue: string;
  categories: string[];
  createdAt?: string;
  updatedAt?: string;
};

// Check if user is volunteer
export const isVolunteer = (userPrefs: any): boolean => {
  return userPrefs?.role === 'volunteer';
};

// Create community post (volunteers only)
export const createCommunityPost = async (data: CommunityPostData, userRole: string): Promise<CommunityPost> => {
  if (userRole !== 'volunteer') {
    throw new Error('Only volunteers can create community posts');
  }

  try {
    const postDataWithDefaults = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const response = await databases.createDocument(
      DATABASE_ID,
      COMMUNITY_POSTS_TABLE_ID,
      AppwriteID.unique(),
      postDataWithDefaults
    );
    
    return {
      $id: response.$id,
      volunteerId: response.volunteerId,
      volunteerName: response.volunteerName,
      caption: response.caption,
      eventTitle: response.eventTitle,
      description: response.description,
      imageUrl: response.imageUrl,
      date: response.date,
      time: response.time,
      venue: response.venue,
      categories: response.categories || [],
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      reactionCount: 0,
      commentCount: 0,
      hasUserReacted: false
    } as CommunityPost;
  } catch (error: any) {
    console.error('Error creating community post:', error);
    throw error;
  }
};

// Get all community posts (accessible to all logged-in users)
export const getAllCommunityPosts = async (currentUserId?: string): Promise<CommunityPost[]> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COMMUNITY_POSTS_TABLE_ID
    );
    
    const posts = await Promise.all(
      response.documents.map(async (post) => {
        const reactionCount = await getReactionCount(post.$id);
        const commentCount = await getCommentCount(post.$id);
        const hasUserReacted = currentUserId ? await hasUserReactedToPost(post.$id, currentUserId) : false;
        
        return {
          $id: post.$id,
          volunteerId: post.volunteerId,
          volunteerName: post.volunteerName,
          caption: post.caption,
          eventTitle: post.eventTitle,
          description: post.description,
          imageUrl: post.imageUrl,
          date: post.date,
          time: post.time,
          venue: post.venue,
          categories: post.categories || [],
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          reactionCount,
          commentCount,
          hasUserReacted
        } as CommunityPost;
      })
    );
    
    return posts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching community posts:', error);
    throw error;
  }
};

// Get posts by specific volunteer
export const getPostsByVolunteer = async (volunteerId: string): Promise<CommunityPost[]> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COMMUNITY_POSTS_TABLE_ID
    );
    
    const volunteerPosts = response.documents
      .filter(post => post.volunteerId === volunteerId)
      .map(post => ({
        $id: post.$id,
        volunteerId: post.volunteerId,
        volunteerName: post.volunteerName,
        caption: post.caption,
        eventTitle: post.eventTitle,
        description: post.description,
        imageUrl: post.imageUrl,
        date: post.date,
        time: post.time,
        venue: post.venue,
        categories: post.categories || [],
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      } as CommunityPost));
    
    return volunteerPosts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching volunteer posts:', error);
    throw error;
  }
};

// Update community post (volunteers only, own posts only)
export const updateCommunityPost = async (
  postId: string, 
  updateData: Partial<CommunityPostData>, 
  userRole: string, 
  userId: string
): Promise<CommunityPost> => {
  if (userRole !== 'volunteer') {
    throw new Error('Only volunteers can update community posts');
  }

  try {
    const existingPost = await getCommunityPostById(postId);
    if (existingPost.volunteerId !== userId) {
      throw new Error('You can only update your own posts');
    }

    const dataWithUpdate = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    const response = await databases.updateDocument(
      DATABASE_ID,
      COMMUNITY_POSTS_TABLE_ID,
      postId,
      dataWithUpdate
    );
    
    return {
      $id: response.$id,
      volunteerId: response.volunteerId,
      volunteerName: response.volunteerName,
      caption: response.caption,
      eventTitle: response.eventTitle,
      description: response.description,
      imageUrl: response.imageUrl,
      date: response.date,
      time: response.time,
      venue: response.venue,
      categories: response.categories || [],
      createdAt: response.createdAt,
      updatedAt: response.updatedAt
    } as CommunityPost;
  } catch (error) {
    console.error('Error updating community post:', error);
    throw error;
  }
};

// Delete community post (volunteers only, own posts only)
export const deleteCommunityPost = async (postId: string, userRole: string, userId: string): Promise<void> => {
  if (userRole !== 'volunteer') {
    throw new Error('Only volunteers can delete community posts');
  }

  try {
    const existingPost = await getCommunityPostById(postId);
    if (existingPost.volunteerId !== userId) {
      throw new Error('You can only delete your own posts');
    }

    await databases.deleteDocument(
      DATABASE_ID,
      COMMUNITY_POSTS_TABLE_ID,
      postId
    );
  } catch (error) {
    console.error('Error deleting community post:', error);
    throw error;
  }
};

// Get single post by ID
export const getCommunityPostById = async (postId: string): Promise<CommunityPost> => {
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      COMMUNITY_POSTS_TABLE_ID,
      postId
    );
    
    return {
      $id: response.$id,
      volunteerId: response.volunteerId,
      volunteerName: response.volunteerName,
      caption: response.caption,
      eventTitle: response.eventTitle,
      description: response.description,
      imageUrl: response.imageUrl,
      date: response.date,
      time: response.time,
      venue: response.venue,
      categories: response.categories || [],
      createdAt: response.createdAt,
      updatedAt: response.updatedAt
    } as CommunityPost;
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    throw error;
  }
};

// Upload image for community post
export const uploadCommunityPostImage = async (file: any): Promise<{ fileId: string; fileUrl: string }> => {
  try {
    if (!file || !file.uri) {
      throw new Error('Invalid file object or missing URI');
    }

    const timestamp = Date.now();
    const fileName = `community_post_${timestamp}.jpg`;
    
    const appwriteFile = {
      name: fileName,
      type: file.mimeType || file.type || 'image/jpeg',
      size: file.fileSize || file.size,
      uri: file.uri,
    };

    if (!appwriteFile.size || appwriteFile.size === 0) {
      throw new Error('File size is 0 or undefined');
    }

    const response = await storage.createFile(
      BUCKET_ID,
      AppwriteID.unique(),
      appwriteFile
    );

    if (!response || !response.$id) {
      throw new Error('File upload failed');
    }

    const fileUrlString = `https://fra.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${response.$id}/view?project=68d43c4e0000ac29ecc0`;
    
    return { fileId: response.$id, fileUrl: fileUrlString };
  } catch (error: any) {
    console.error('Error uploading community post image:', error);
    throw error;
  }
};

// REACTION FUNCTIONS (all users can react)

export const addReaction = async (postId: string, userId: string, userName: string): Promise<Reaction> => {
  try {
    const reactionData = {
      postId,
      userId,
      userName,
      createdAt: new Date().toISOString()
    };
    
    const response = await databases.createDocument(
      DATABASE_ID,
      REACTIONS_TABLE_ID,
      AppwriteID.unique(),
      reactionData
    );
    
    return {
      $id: response.$id,
      postId: response.postId,
      userId: response.userId,
      userName: response.userName,
      createdAt: response.createdAt
    } as Reaction;
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }
};

export const removeReaction = async (postId: string, userId: string): Promise<void> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      REACTIONS_TABLE_ID
    );
    
    const reactionToDelete = response.documents.find(
      reaction => reaction.postId === postId && reaction.userId === userId
    );
    
    if (reactionToDelete) {
      await databases.deleteDocument(
        DATABASE_ID,
        REACTIONS_TABLE_ID,
        reactionToDelete.$id
      );
    }
  } catch (error) {
    console.error('Error removing reaction:', error);
    throw error;
  }
};

export const getReactionCount = async (postId: string): Promise<number> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      REACTIONS_TABLE_ID
    );
    
    return response.documents.filter(reaction => reaction.postId === postId).length;
  } catch (error) {
    console.error('Error getting reaction count:', error);
    return 0;
  }
};

export const hasUserReactedToPost = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      REACTIONS_TABLE_ID
    );
    
    return response.documents.some(reaction => 
      reaction.postId === postId && reaction.userId === userId
    );
  } catch (error) {
    console.error('Error checking user reaction:', error);
    return false;
  }
};

// COMMENT FUNCTIONS (all users can comment)

export const addComment = async (postId: string, userId: string, userName: string, content: string): Promise<Comment> => {
  try {
    const commentData = {
      postId,
      userId,
      userName,
      content,
      createdAt: new Date().toISOString()
    };
    
    const response = await databases.createDocument(
      DATABASE_ID,
      COMMENTS_TABLE_ID,
      AppwriteID.unique(),
      commentData
    );
    
    return {
      $id: response.$id,
      postId: response.postId,
      userId: response.userId,
      userName: response.userName,
      content: response.content,
      createdAt: response.createdAt
    } as Comment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const getCommentsByPostId = async (postId: string): Promise<Comment[]> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COMMENTS_TABLE_ID
    );
    
    const postComments = response.documents
      .filter(comment => comment.postId === postId)
      .map(comment => ({
        $id: comment.$id,
        postId: comment.postId,
        userId: comment.userId,
        userName: comment.userName,
        content: comment.content,
        createdAt: comment.createdAt
      } as Comment));
    
    return postComments.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const getCommentCount = async (postId: string): Promise<number> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COMMENTS_TABLE_ID
    );
    
    return response.documents.filter(comment => comment.postId === postId).length;
  } catch (error) {
    console.error('Error getting comment count:', error);
    return 0;
  }
};

// Get user statistics
export const getUserStats = async (volunteerId: string): Promise<{
  totalPosts: number;
  totalReactions: number;
  totalComments: number;
}> => {
  try {
    // Get all posts by the volunteer
    const postsResponse = await databases.listDocuments(
      DATABASE_ID,
      COMMUNITY_POSTS_TABLE_ID
    );
    
    const userPosts = postsResponse.documents.filter(
      post => post.volunteerId === volunteerId
    );
    
    const totalPosts = userPosts.length;
    
    // Get all reactions for user's posts
    const reactionsResponse = await databases.listDocuments(
      DATABASE_ID,
      REACTIONS_TABLE_ID
    );
    
    const totalReactions = reactionsResponse.documents.filter(reaction =>
      userPosts.some(post => post.$id === reaction.postId)
    ).length;
    
    // Get all comments for user's posts
    const commentsResponse = await databases.listDocuments(
      DATABASE_ID,
      COMMENTS_TABLE_ID
    );
    
    const totalComments = commentsResponse.documents.filter(comment =>
      userPosts.some(post => post.$id === comment.postId)
    ).length;
    
    return {
      totalPosts,
      totalReactions,
      totalComments
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      totalPosts: 0,
      totalReactions: 0,
      totalComments: 0
    };
  }
};

// Helper function to format time ago
export const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const postDate = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
};