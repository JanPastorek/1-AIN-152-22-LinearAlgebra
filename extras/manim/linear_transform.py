# Optional animation retained from the original geometry notebook.
# See docs/sources.md for notebook provenance.
from manim import *


class LinearTrans(LinearTransformationScene):
    def __init__(self, **kwargs):
        # linear transformation
        matrix = [[2, 1],
                  [0, 1]]
        super().__init__(
            show_coordinates=True,
            leave_ghost_vectors=True,
            # include_background_grid=True,
            **kwargs
        )
        self.matrix = matrix

    def construct(self):
        # Add a sample vector
        vector = Vector([1, 2], color=YELLOW)
        self.add_vector(vector)

        # Apply the linear transformation
        self.apply_matrix(self.matrix)

        # Wait to see the result
        self.wait()
