#!/usr/bin/env python3
""" LFUCache module
"""
from base_caching import BaseCaching


class LFUCache(BaseCaching):
    """ LFUCache defines a LFU caching system
    """

    def __init__(self):
        """ Initialize
        """
        super().__init__()
        self.frequency = {}  # To store frequency of keys
        self.order = {}  # To store order of keys for LRU tie-breaking

    def put(self, key, item):
        """ Add an item in the cache
        """
        if key is None or item is None:
            return

        if key in self.cache_data:
            # If key is already in cache, update the item and frequency
            self.cache_data[key] = item
            self.frequency[key] += 1
            self.order[key] = len(self.order)
        else:
            # If new key, add it to cache
            if len(self.cache_data) >= BaseCaching.MAX_ITEMS:
                # Find the least frequently used key
                lfu_key = min(self.frequency,
                              key=lambda k: (self.frequency[k], self.order[k]))
                print(f"DISCARD: {lfu_key}")
                del self.cache_data[lfu_key]
                del self.frequency[lfu_key]
                del self.order[lfu_key]

            self.cache_data[key] = item
            self.frequency[key] = 1
            self.order[key] = len(self.order)

    def get(self, key):
        """ Get an item by key
        """
        if key is None or key not in self.cache_data:
            return None
        self.frequency[key] += 1
        self.order[key] = len(self.order)
        return self.cache_data[key]
