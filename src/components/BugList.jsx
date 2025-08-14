import React from 'react'
import BugCard from './BugCard'

function BugList({ bugs, editMode, handleDelete, handleUpdate }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {bugs.map((bug, i) => (
        <BugCard
          key={bug._id || i}
          bug={bug}
          editMode={editMode}
          onDelete={() => handleDelete(bug._id)}
          onUpdate={(updatedFields) => handleUpdate(bug._id, updatedFields)}
          toggleEdit={toggleEdit}
        />
      ))}
    </div>
  )
}

export default BugList
