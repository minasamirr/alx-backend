#!/usr/bin/env python3
"""
Deletion-resilient hypermedia pagination module
"""

import csv
from typing import List, Dict, Tuple


def index_range(page: int, page_size: int) -> Tuple[int, int]:
    """
    Return a tuple of size two containing a start index and an end index
    corresponding to the range of indexes to return in a list for those
    pagination parameters.

    Args:
        page (int): The current page number.
        page_size (int): The number of items per page.

    Returns:
        Tuple[int, int]: A tuple containing the start index and end index.
    """
    start = (page - 1) * page_size
    end = start + page_size
    return start, end


class Server:
    """Server class to paginate a database of popular baby names.
    """
    DATA_FILE = "Popular_Baby_Names.csv"

    def __init__(self):
        self.__dataset = None
        self.__indexed_dataset = None

    def dataset(self) -> List[List]:
        """Cached dataset
        """
        if self.__dataset is None:
            with open(self.DATA_FILE) as f:
                reader = csv.reader(f)
                dataset = [row for row in reader]
            self.__dataset = dataset[1:]

        return self.__dataset

    def indexed_dataset(self) -> Dict[int, List]:
        """Dataset indexed by sorting position, starting at 0
        """
        if self.__indexed_dataset is None:
            dataset = self.dataset()
            self.__indexed_dataset = {
                i: dataset[i] for i in range(len(dataset))}

        return self.__indexed_dataset

    def get_page(self, page: int = 1, page_size: int = 10) -> List[List]:
        """
        Return a page of the dataset.

        Args:
            page (int): The page number (default is 1).
            page_size (int): The size of the page (default is 10).

        Returns:
            List[List]: A list of lists representing the rows of the dataset.
        """
        assert isinstance(page, int) and page > 0
        assert isinstance(page_size, int) and page_size > 0

        start, end = index_range(page, page_size)
        dataset = self.dataset()

        if start >= len(dataset):
            return []

        return dataset[start:end]

    def get_hyper_index(
            self, page: int = 1, page_size: int = 10) -> Dict[str, any]:
        """
        Return a dictionary containing pagination details that is
        deletion-resilient.

        Args:
            page (int): The page number (default is 1).
            page_size (int): The size of the page (default is 10).

        Returns:
            Dict[str, any]: A dictionary with pagination details.
        """
        assert isinstance(page, int) and page > 0
        assert isinstance(page_size, int) and page_size > 0

        indexed_data = self.indexed_dataset()
        start, end = index_range(page, page_size)

        data = []
        next_index = start

        while len(data) < page_size and next_index < len(indexed_data):
            if next_index in indexed_data:
                data.append(indexed_data[next_index])
            next_index += 1

        total_pages = (len(indexed_data) + page_size - 1) // page_size

        return {
            'index': start,
            'next_index':
            next_index if next_index < len(indexed_data) else None,
            'page_size': len(data),
            'page': page,
            'data': data,
        }
