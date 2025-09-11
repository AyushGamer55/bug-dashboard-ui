// src/utils/validateurl.js

export async function validateImageUrl(url) {
  // Check if URL is a valid format
  try {
    new URL(url);
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }

  // Convert cloud storage sharing links to direct download links
  url = convertToDirectLink(url);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'no-cors', // Try no-cors mode for cross-origin requests
    });
    clearTimeout(timeoutId);

    // With no-cors mode, we can't read headers, so we assume it's valid if no error
    if (response.type === 'opaque') {
      // Opaque response means CORS blocked, but request succeeded
      return { valid: true };
    }

    const contentType = response.headers.get("Content-Type");

    if (response.ok && contentType && contentType.startsWith("image/")) {
      // Image URL is valid
      return { valid: true };
    } else if (!response.ok) {
      return { valid: false, error: `HTTP ${response.status}: ${response.statusText}` };
    } else if (!contentType || !contentType.startsWith("image/")) {
      return { valid: false, error: "URL does not point to an image" };
    } else {
      return { valid: false, error: "Invalid image URL" };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return { valid: false, error: "Request timed out" };
    } else {
      // For SharePoint/OneDrive, try a different approach
      if (url.includes('sharepoint.com') || url.includes('onedrive.live.com')) {
        // Assume it's valid for cloud storage links that fail CORS check
        return { valid: true };
      }
      return { valid: false, error: "Network error or CORS issue" };
    }
  }
}

// Convert cloud storage sharing links to direct download links
export function convertToDirectLink(url) {
  try {
    const urlObj = new URL(url);

    // Google Drive
    if (urlObj.hostname === 'drive.google.com' && urlObj.pathname.startsWith('/file/d/')) {
      const fileId = urlObj.pathname.split('/')[3];
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    // Dropbox
    if (urlObj.hostname === 'www.dropbox.com' && urlObj.pathname.startsWith('/s/')) {
      return url.replace('?dl=0', '?dl=1').replace(/$/, '?dl=1');
    }

    // OneDrive
    if (urlObj.hostname === 'onedrive.live.com' || urlObj.hostname === '1drv.ms') {
      if (urlObj.searchParams.has('id')) {
        const id = urlObj.searchParams.get('id');
        const cid = urlObj.searchParams.get('cid') || '';
        return `https://onedrive.live.com/download?id=${id}${cid ? `&cid=${cid}` : ''}`;
      }
    }

    // SharePoint/OneDrive for Business
    if (urlObj.hostname.includes('sharepoint.com') && urlObj.pathname.includes('/:i:/')) {
      // Extract the file path from SharePoint URL
      const pathParts = urlObj.pathname.split('/:i:/');
      if (pathParts.length >= 2) {
        let filePath = pathParts[1];

        // Handle personal OneDrive for Business URLs
        if (filePath.startsWith('g/personal/')) {
          // Extract user domain and file ID
          const personalParts = filePath.replace('g/personal/', '').split('/');
          if (personalParts.length >= 2) {
            const userDomain = personalParts[0];
            const fileId = personalParts[personalParts.length - 1];
            const baseUrl = urlObj.origin;
            // Try the UniqueId approach for OneDrive for Business
            return `${baseUrl}/personal/${userDomain}/_layouts/15/download.aspx?UniqueId=${fileId}`;
          }
        } else if (filePath.startsWith('g/')) {
          // Handle other SharePoint paths
          const sitePath = filePath.replace('g/', '');
          const baseUrl = urlObj.origin;
          return `${baseUrl}/_layouts/15/download.aspx?SourceUrl=/${sitePath}`;
        }
      }
    }

    // If no conversion needed, return original URL
    return url;
  } catch {
    return url;
  }
}
