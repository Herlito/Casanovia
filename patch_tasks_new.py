with open('src/components/private/NewWeddingTasksScreen.tsx', 'r') as f:
    text = f.read()

text = text.replace("addTask({\n      title: newTitle.trim(),\n      phase: newPhase,\n      priority: newPriority,\n      assignee: newAssignee\n    });", "addTask({\n      title: newTitle.trim(),\n      phase: newPhase,\n      priority: newPriority,\n      assignee: newAssignee,\n      isCompleted: false\n    });")

with open('src/components/private/NewWeddingTasksScreen.tsx', 'w') as f:
    f.write(text)
