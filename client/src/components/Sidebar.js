import React from 'react';

const Sidebar = ({ role }) => {
  if (role === 'employee') {
    return (
      <div className="bg-light p-3">
        <ul className="list-group">
          <li className="list-group-item">Punch In/Out</li>
          <li className="list-group-item">Leave Requests</li>
        </ul>
      </div>
    );
  }
  // Add for other roles if needed
  return null;
};

export default Sidebar;