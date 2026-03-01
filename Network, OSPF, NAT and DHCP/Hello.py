from collections import deque

# Definition for a binary tree node.
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    # RECURSIVE (DFS)
    def maxDepth(self, root):
        if not root:            # base case
            return 0
        
        left = self.maxDepth(root.left)
        right = self.maxDepth(root.right)

        return 1 + max(left, right)


# Helper: build tree from list like LeetCode input
def build_tree(values):
    if not values:
        return None
    
    root = TreeNode(values[0])
    queue = deque([root])
    i = 1

    while queue and i < len(values):
        node = queue.popleft()

        # left child
        if values[i] is not None:
            node.left = TreeNode(values[i])
            queue.append(node.left)
        i += 1

        if i >= len(values):
            break

        # right child
        if values[i] is not None:
            node.right = TreeNode(values[i])
            queue.append(node.right)
        i += 1

    return root


# ================= RUN TESTS =================
if __name__ == "__main__":
    sol = Solution()

    # Example 1
    tree1 = build_tree([3,9,20,None,None,15,7])
    print("Depth:", sol.maxDepth(tree1))   # expected 3

    # Example 2
    tree2 = build_tree([1,None,2])
    print("Depth:", sol.maxDepth(tree2))   # expected 2

    # Edge case
    tree3 = build_tree([])
    print("Depth:", sol.maxDepth(tree3))   # expected 0