package daemon

import (
	"fmt"
)

type TreeNode struct {
	Id     int
	Parent int
	Status int
}

func SyncTreeStatus(in_tree *map[int]*TreeNode) {
	_ = fmt.Errorf("")
	tree := TreeMgr{}
	tree.NewTreeMgr(in_tree)
	tree.SetTreeStatus(0)
}

type TreeMgr struct {
	tree *map[int]*TreeNode
}

func (t *TreeMgr) NewTreeMgr(tree *map[int]*TreeNode) {
	t.tree = tree
}

func (t *TreeMgr) SetTreeStatus(parent int) {
	for id, node := range *t.tree {
		if node.Parent != parent {
			continue
		}
		// fmt.Println("---child--->", id, node, t.hasChildren(id))
		if t.hasChildren(id) {
			t.SetTreeStatus(id)
			sta := t.getMaxChildrenLevel(id)
			if sta > node.Status {
				node.Status = sta
			}
		}
	}
}

func (t *TreeMgr) hasChildren(nodeid int) bool {
	for _, node := range *t.tree {
		if node.Parent == nodeid {
			return true
		}
	}
	return false
}

func (t *TreeMgr) getMaxChildrenLevel(parent int) int {
	maxLevel := -1
	for id, node := range *t.tree {
		if node.Parent != parent {
			continue
		}
		// fmt.Println(parent, "-----MAX----->", id, node, t.hasChildren(id))
		if t.hasChildren(id) {
			sta := t.getMaxChildrenLevel(id)
			if sta > maxLevel {
				maxLevel = sta
			}
		} else {
			if node.Status > maxLevel {
				maxLevel = node.Status
			}
		}
	}
	// fmt.Println(parent, "==(ret)==", maxLevel)
	return maxLevel
}
