// Function to generate popup HTML for different event types
export const generatePopupHTML = (properties: any) => {
  if (properties.type === 'warning') {
    // Special popup for warning markers with Twitter data
    let socialMetrics: any = {};
    let userInfo: any = {};
    
    try {
      socialMetrics = JSON.parse(properties.socialMetrics || '{}');
      userInfo = JSON.parse(properties.userInfo || '{}');
    } catch (e) {
      console.warn('Failed to parse warning marker data:', e);
    }
    
    // Calculate user age in days
    const userCreated = new Date(userInfo.created_at || '2020-01-01');
    const userAgeDays = Math.floor((Date.now() - userCreated.getTime()) / (1000 * 60 * 60 * 24));
    
    // Bot detection indicators
    const followersCount = userInfo.followers_count || 0;
    const friendsCount = userInfo.friends_count || 0;
    const followerRatio = friendsCount > 0 ? (followersCount / friendsCount) : 0;
    const isLikelyBot = userAgeDays < 30 || followerRatio < 0.1 || friendsCount > followersCount * 5;
    const accountYear = new Date(new Date().getTime() - userAgeDays * 24 * 60 * 60 * 1000).getFullYear();
    
    // Truncate description if too long
    const truncatedDescription = properties.description && properties.description.length > 120 
      ? properties.description.substring(0, 120) + '...' 
      : properties.description || 'No description available';
    
    return `
      <div class="custom-popup-content">
        <!-- Header with verification badge -->
        <div class="popup-header">
          <h3 class="popup-title">
            ${properties.emoji} ${properties.title}
          </h3>
          ${userInfo.verified ? '<span class="verified-badge">✓ VERIFIED</span>' : ''}
        </div>

        <p class="popup-description">
          ${truncatedDescription}
        </p>

        <!-- Compact Warning Alert -->
        <div class="popup-warning-alert">
          <div class="popup-warning-text">
            ⚠️ ${properties.extractedLocation || 'Unknown Location'} • ${Math.round((properties.confidenceScore || 0) * 100)}% confidence
          </div>
        </div>

        <!-- Compact Social Metrics -->
        <div class="popup-metrics">
          ${socialMetrics.views && socialMetrics.views !== '0' ? `
            <span class="metric-badge">
              👀 Views: ${socialMetrics.views}
            </span>
          ` : ''}
          ${socialMetrics.retweets && socialMetrics.retweets > 10 ? `
            <span class="metric-badge">
              🔄 Retweets: ${socialMetrics.retweets}
            </span>
          ` : ''}
        </div>

        <!-- Compact User Info -->
        <div class="popup-user-info">
          <div class="popup-user-text">
            ${isLikelyBot ? '🤖 Potential Bot' : '👤 User'} • Since ${accountYear} • ${followersCount.toLocaleString()} followers
          </div>
        </div>

        <!-- Compact Metadata -->
        <div class="popup-metadata">
          <div class="popup-meta-text">
            Twitter • ${new Date(properties.createdAt).toLocaleDateString()} •
            ${properties.verified ? '<span class="verified-text">Verified</span>' : '<span class="unverified-text">Unverified Account</span>'}
          </div>
          ${properties.url ? `<a href="${properties.url}" target="_blank" class="popup-link">View Tweet →</a>` : ''}
        </div>
      </div>
    `;
  } else if (properties.type === 'road_closure') {
    // Special popup for road closures
    const severityColors: Record<string, string> = {
      'low': '#f59e0b',
      'medium': '#f97316', 
      'high': '#ef4444',
      'critical': '#dc2626'
    };
    const severityColor = severityColors[properties.severity] || '#ef4444';
    
    const severityText = properties.severity ? properties.severity.charAt(0).toUpperCase() + properties.severity.slice(1) : 'Unknown';
    
    return `
      <div class="custom-popup-content">
        <!-- Header with road closure icon and severity -->
        <div class="popup-header">
          <h3 class="popup-title">
            ${properties.emoji} ${properties.title}
          </h3>
          ${properties.severity ? `<span class="severity-badge" style="background: ${severityColor};">${severityText.toUpperCase()}</span>` : ''}
        </div>

        <p class="popup-description">
          ${properties.description || 'Road closure reported from private sources'}
        </p>

        <!-- Road Closure Alert -->
        <div class="popup-warning-alert">
          <div class="popup-warning-text">
            🚧 Road Closure Alert
          </div>
          ${properties.extractedLocation ? `<div class="popup-warning-location">Location: ${properties.extractedLocation}</div>` : ''}
        </div>

        <!-- Road Closure Details -->
        <div class="popup-details">
          ${properties.closureType ? `<div class="detail-item"><span>🚧</span><span>Type: <strong>${properties.closureType}</strong></span></div>` : ''}
          ${properties.reason ? `<div class="detail-item"><span>❓</span><span>Reason: <strong>${properties.reason}</strong></span></div>` : ''}
          ${properties.affectedRoutes && properties.affectedRoutes.length > 0 ? `<div class="detail-item"><span>🛣️</span><span>Affected: <strong>${properties.affectedRoutes.join(', ')}</strong></span></div>` : ''}
          ${properties.alternativeRoutes && properties.alternativeRoutes.length > 0 ? `<div class="detail-item"><span>↩️</span><span>Alternative: <strong>${properties.alternativeRoutes.join(', ')}</strong></span></div>` : ''}
        </div>

        <!-- Metadata -->
        <div class="popup-user-info">
          <div class="popup-user-text">
            <div class="meta-item">
              <span>🔗</span>
              <span>Source: <strong>${properties.source}</strong></span>
            </div>
            <div class="meta-item">
              <span>⏰</span>
              <span>${new Date(properties.createdAt).toLocaleString()}</span>
            </div>
            ${properties.verified ? '<div class="meta-item"><span>✅</span><span class="verified-text">Verified</span></div>' : '<div class="meta-item"><span>⚠️</span><span class="unverified-text">Verified Anonymous Tips</span></div>'}
            ${properties.url ? `<a href="${properties.url}" target="_blank" class="popup-link">🔗 View Source →</a>` : ''}
          </div>
        </div>
      </div>
    `;
  } else {
    // Regular popup for other event types
    return `
      <div class="custom-popup-content">
        <h3 class="popup-title">
          ${properties.emoji} ${properties.title}
        </h3>
        <br/>
        <p class="popup-description">
          ${properties.description || 'No description available'}
        </p>
        <div class="popup-details">
          <div class="detail-item">
            <span>📍</span>
            <span>Type: <strong>${properties.type}</strong></span>
          </div>
          <div class="detail-item">
            <span>🔗</span>
            <span>Source: <strong>${properties.source}</strong></span>
          </div>
          <div class="detail-item">
            <span>⏰</span>
            <span>${new Date(properties.originalCreatedAt || properties.createdAt).toLocaleString()}</span>
          </div>
          ${properties.verified ? '<div class="detail-item"><span>✅</span><span class="verified-text">Verified Event</span></div>' : ''}
          ${properties.url ? `<a href="${properties.url}" target="_blank" class="popup-link">🔗 View Original Source →</a>` : ''}
        </div>
      </div>
    `;
  }
};
