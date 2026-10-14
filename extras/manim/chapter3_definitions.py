"""
Manim scenes for Chapter 3 (Vector Spaces) of
S. J. Leon, Linear Algebra with Applications (8th ed.).

Render:  manim -qm extras/manim/chapter3_definitions.py LinearDependence
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from la_style import *  # noqa: E402,F401,F403


def arrow(p, a, b, color, w=6):
    return Arrow(p.c2p(*a), p.c2p(*b), buff=0, color=color, stroke_width=w, max_tip_length_to_length_ratio=0.18)


# =================================================================
# 3.1  Vector spaces: arrows, polynomials, matrices
# =================================================================
class VectorSpaceExamples(Scene):
    def construct(self):
        self.add(title(r"A vector space: anything you can add and scale by the same rules"))
        ax = Axes(x_range=[-1.5, 1.5, 0.5], y_range=[-2, 4, 1], x_length=5.2, y_length=4.4,
                  axis_config={"color": MUTE, "stroke_width": 2}).shift(LEFT * 3.3 + DOWN * 0.4)
        self.play(Create(ax))
        p = ax.plot(lambda x: 1 + 2 * x, color=C1, x_range=[-1.5, 1.5])
        qf = ax.plot(lambda x: x - x * x, color=C2, x_range=[-1, 1.5])
        s = ax.plot(lambda x: 1 + 3 * x - x * x, color=C3, x_range=[-0.8, 1.5])
        lp = MathTex(r"p(x) = 1 + 2x", color=C1, font_size=34)
        lq = MathTex(r"q(x) = x - x^2", color=C2, font_size=34)
        ls = MathTex(r"(p+q)(x) = 1 + 3x - x^2", color=C3, font_size=34)
        lab = VGroup(lp, lq, ls).arrange(DOWN, aligned_edge=LEFT, buff=0.25).to_corner(UR).shift(DOWN * 0.9 + LEFT * 0.2)
        self.play(Create(p), Write(lp))
        self.play(Create(qf), Write(lq))
        self.play(TransformFromCopy(VGroup(p, qf), s), Write(ls))
        self.wait(0.6)
        v1, v2, v3 = mat([[1], [2], [0]], scale=0.7), mat([[0], [1], [-1]], scale=0.7), mat([[1], [3], [-1]], scale=0.7)
        v1.get_entries().set_color(C1); v2.get_entries().set_color(C2); v3.get_entries().set_color(C3)
        coeff = VGroup(v1, MathTex("+"), v2, MathTex("="), v3).arrange(RIGHT, buff=0.25).next_to(lab, DOWN, buff=0.6)
        ct = Tex(r"the same sum on coefficient\\vectors $(a_0, a_1, a_2)$", font_size=28, color=MUTE).next_to(coeff, DOWN, buff=0.25)
        self.play(FadeIn(coeff), FadeIn(ct))
        self.wait(1)
        rules = Tex(r"closure under $+$ and scalar multiples, a zero vector, negatives,\\ and the usual algebra laws (axioms A1--A8)", font_size=30)
        self.play(FadeIn(boxed(rules).to_edge(DOWN, buff=0.3)))
        self.wait(2)


# =================================================================
# 3.2  Subspaces: a line through the origin, and one that misses it
# =================================================================
class Subspace(Scene):
    def construct(self):
        p = plane((-6, 6), (-4, 4))
        t = title(r"A subspace is closed under addition and scalar multiplication")
        self.add(p, BackgroundRectangle(t, fill_color=BG, fill_opacity=0.9, buff=0.1), t)
        L = Line(p.c2p(-2.2, -4.4), p.c2p(2.2, 4.4), color=C3, stroke_width=5)
        lab = boxed(MathTex(r"S = \{(x_1, x_2) : x_2 = 2x_1\}", color=C3, font_size=36)).to_corner(UL).shift(DOWN * 0.9)
        self.play(Create(L), FadeIn(lab))
        u, v = np.array([0.5, 1.0]), np.array([1.0, 2.0])
        au, av = arrow(p, (0, 0), u, C1), arrow(p, (0, 0), v, C2)
        self.play(GrowArrow(au), GrowArrow(av))
        s = arrow(p, u, u + v, C2, 5)
        r = arrow(p, (0, 0), u + v, AMB, 6)
        self.play(TransformFromCopy(av, s))
        self.play(GrowArrow(r))
        ok1 = boxed(Tex(r"$\mathbf u + \mathbf v$ stays on the line", font_size=32, color=C3)).to_corner(UR).shift(DOWN * 0.9)
        self.play(FadeIn(ok1))
        neg = arrow(p, (0, 0), -1.5 * v, C1, 6)
        self.play(GrowArrow(neg))
        ok2 = boxed(Tex(r"$-1.5\,\mathbf v$ stays on the line, and so does $\mathbf 0$", font_size=32, color=C3)).next_to(ok1, DOWN, aligned_edge=RIGHT)
        self.play(FadeIn(ok2))
        self.wait(1)
        self.play(FadeOut(VGroup(au, av, s, r, neg, ok1, ok2)))
        L2 = Line(p.c2p(-2.7, -4.4), p.c2p(1.7, 4.4), color=WARN, stroke_width=5)
        lab2 = boxed(MathTex(r"T = \{(x_1, x_2) : x_2 = 2x_1 + 1\}", color=WARN, font_size=36)).to_corner(UL).shift(DOWN * 0.9)
        self.play(ReplacementTransform(L, L2), FadeTransform(lab, lab2))
        self.bring_to_front(*[m for m in self.mobjects if isinstance(m, BackgroundRectangle)], t)
        u2, v2 = np.array([0.0, 1.0]), np.array([-1.0, -1.0])
        a2, b2 = arrow(p, (0, 0), u2, C1), arrow(p, (0, 0), v2, C2)
        self.play(GrowArrow(a2), GrowArrow(b2))
        sum2 = arrow(p, (0, 0), u2 + v2, AMB, 6)
        self.play(GrowArrow(sum2), Flash(p.c2p(*(u2 + v2)), color=WARN))
        bad = boxed(Tex(r"$(0,1) + (-1,-1) = (-1,0)$ is not on $T$, and $\mathbf 0 \notin T$: not a subspace", font_size=32, color=WARN)).to_edge(DOWN, buff=0.35)
        self.play(FadeIn(bad))
        self.wait(2)


# =================================================================
# 3.2  Span: line, plane, all of R^3
# =================================================================
class Span3D(ThreeDScene):
    def construct(self):
        self.set_camera_orientation(phi=68 * DEGREES, theta=-45 * DEGREES, zoom=0.9)
        axes = ThreeDAxes(x_range=[-3, 3], y_range=[-3, 3], z_range=[-3, 3], x_length=6, y_length=6, z_length=5,
                          axis_config={"color": MUTE, "stroke_width": 2})
        t = title(r"$\mathrm{Span}(\mathbf v_1, \ldots, \mathbf v_k)$: all linear combinations")
        self.add_fixed_in_frame_mobjects(t)
        self.add(axes)

        def vec(v, color):
            return Arrow3D(axes.c2p(0, 0, 0), axes.c2p(*v), color=color, thickness=0.02)

        def note(tex, col=INK):
            m = boxed(Tex(tex, font_size=32, color=col)).to_edge(DOWN, buff=0.35)
            self.add_fixed_in_frame_mobjects(m); self.remove(m)
            return m

        v1, v2, v3, v4 = (1.5, 0.5, 0.5), (-0.5, 1.5, 0.5), (1, 2, 1), (0, 0, 2)
        a1 = vec(v1, C1)
        self.play(Create(a1))
        line = Line3D(axes.c2p(*(-2 * np.array(v1))), axes.c2p(*(2 * np.array(v1))), color=C1, thickness=0.015)
        n1 = note(r"one nonzero vector spans a line")
        self.play(Create(line), FadeIn(n1))
        self.wait(1)
        a2 = vec(v2, C2)
        n = np.cross(v1, v2)
        u = np.array(v1) / np.linalg.norm(v1); w = np.cross(n, u); w /= np.linalg.norm(w)
        pl = Surface(lambda s, r: axes.c2p(*(2.6 * s * u + 2.6 * r * w)), u_range=[-1, 1], v_range=[-1, 1], resolution=(6, 6),
                     fill_color=C2, fill_opacity=0.3, checkerboard_colors=False, stroke_color=C2, stroke_width=0.4)
        n2 = note(r"a second, independent vector: the span is a plane")
        self.play(Create(a2), FadeTransform(n1, n2))
        self.play(Create(pl))
        self.wait(1)
        a3 = vec(v3, AMB)
        n3 = note(r"$\mathbf v_3 = \mathbf v_1 + \mathbf v_2$ lies in the plane: the span does not grow", AMB)
        self.play(Create(a3), FadeTransform(n2, n3))
        self.wait(1.2)
        a4 = vec(v4, C3)
        n4 = note(r"a vector off the plane: now the span is all of $\mathbb{R}^3$", C3)
        self.play(Create(a4), FadeTransform(n3, n4))
        self.begin_ambient_camera_rotation(rate=0.3)
        self.wait(4)
        self.stop_ambient_camera_rotation()


# =================================================================
# 3.3  Linear dependence, and how to decide it
# =================================================================
class LinearDependence(Scene):
    def construct(self):
        p = plane((-2, 6), (-1.5, 4.5)).scale(0.85).shift(LEFT * 3.4 + DOWN * 0.7)
        t = title(r"Dependent: some nontrivial combination gives $\mathbf 0$")
        self.add(p, BackgroundRectangle(t, fill_color=BG, fill_opacity=0.9, buff=0.1), t)
        v1, v2, v3 = np.array([2.0, 1.0]), np.array([1.0, 2.0]), np.array([4.0, 5.0])
        a1, a2, a3 = arrow(p, (0, 0), v1, C1), arrow(p, (0, 0), v2, C2), arrow(p, (0, 0), v3, AMB)
        lab = VGroup(MathTex(r"\mathbf v_1", color=C1).next_to(a1.get_end(), DR, buff=0.05),
                     MathTex(r"\mathbf v_2", color=C2).next_to(a2.get_end(), LEFT, buff=0.05),
                     MathTex(r"\mathbf v_3", color=AMB).next_to(a3.get_end(), RIGHT, buff=0.1))
        self.play(GrowArrow(a1), GrowArrow(a2), GrowArrow(a3), FadeIn(lab))
        self.wait(0.6)
        # v3 = 1 v1 + 2 v2 tip to tail
        s1 = arrow(p, (0, 0), v1, C1, 7)
        s2 = arrow(p, v1, v1 + 2 * v2, C2, 7)
        self.play(TransformFromCopy(a1, s1))
        self.play(TransformFromCopy(a2, s2))
        g = MathTex(r"\mathbf v_1 + 2\mathbf v_2 = \mathbf v_3", font_size=36)
        g2 = MathTex(r"1\,\mathbf v_1 + 2\,\mathbf v_2 - 1\,\mathbf v_3 = \mathbf 0", font_size=36, color=C3)
        geo = boxed(VGroup(g, g2).arrange(DOWN, aligned_edge=LEFT)).to_corner(UR).shift(DOWN * 0.8)
        self.play(FadeIn(geo))
        self.wait(1)
        # algebraic test
        X = mat([[2, 1, 4], [1, 2, 5]], scale=0.75)
        X.get_columns()[0].set_color(C1); X.get_columns()[1].set_color(C2); X.get_columns()[2].set_color(AMB)
        R = mat([[1, 0, 1], [0, 1, 2]], scale=0.75)
        hdr = Tex(r"Test: put the vectors in the columns of $X$, solve $X\mathbf c = \mathbf 0$", font_size=28, color=MUTE)
        row = VGroup(MathTex("X =", font_size=34), X, MathTex(r"\xrightarrow{\text{RREF}}", font_size=34), R).arrange(RIGHT, buff=0.2)
        alg = VGroup(hdr, row).arrange(DOWN, aligned_edge=LEFT, buff=0.25).next_to(geo, DOWN, buff=0.35, aligned_edge=RIGHT)
        self.play(FadeIn(hdr), FadeIn(row[0], X))
        self.play(FadeIn(row[2]), TransformFromCopy(X, R), run_time=1.4)
        free = SurroundingRectangle(R.get_columns()[2], color=AMB, buff=0.08)
        self.play(Create(free))
        res = Tex(r"column 3 has no pivot: $c_3$ is free. Set $c_3 = -1$:\\ $c_1 = 1,\ c_2 = 2$, the same relation", font_size=28, color=C3).next_to(alg, DOWN, buff=0.3, aligned_edge=RIGHT)
        self.play(Write(res))
        fin = boxed(Tex(r"No free columns $\iff$ only $\mathbf c = \mathbf 0$ $\iff$ linearly independent", font_size=32, color=C3)).to_edge(DOWN, buff=0.3)
        self.play(FadeIn(fin))
        self.wait(2)


# =================================================================
# 3.4  Basis and coordinates
# =================================================================
class BasisCoordinates(Scene):
    def construct(self):
        p = plane((-8, 8), (-2, 8)).scale(0.68).move_to(DOWN * 0.55)
        t = title(r"A basis: independent and spanning, so coordinates are unique")
        self.add(p, BackgroundRectangle(t, fill_color=BG, fill_opacity=0.9, buff=0.1), t)
        b1, b2 = np.array([2.0, 1.0]), np.array([1.0, 4.0])
        grid = VGroup()
        for k in range(-6, 7):
            grid.add(Line(p.c2p(*(k * b1 - 4 * b2)), p.c2p(*(k * b1 + 4 * b2)), color=C2, stroke_opacity=0.35, stroke_width=1.5))
            grid.add(Line(p.c2p(*(k * b2 - 6 * b1)), p.c2p(*(k * b2 + 6 * b1)), color=C1, stroke_opacity=0.35, stroke_width=1.5))
        A1, A2 = arrow(p, (0, 0), b1, C1), arrow(p, (0, 0), b2, C2)
        l = VGroup(MathTex(r"\mathbf y", color=C1).next_to(A1.get_end(), DR, buff=0.05), MathTex(r"\mathbf z", color=C2).next_to(A2.get_end(), LEFT, buff=0.05))
        self.play(GrowArrow(A1), GrowArrow(A2), FadeIn(l))
        self.play(Create(grid), run_time=1.6)
        self.bring_to_front(*[m for m in self.mobjects if isinstance(m, BackgroundRectangle)], t)
        x = np.array([7.0, 7.0])
        X = Dot(p.c2p(*x), color=INK, radius=0.09)
        lx = MathTex(r"\mathbf x = (7, 7)^T", font_size=34).next_to(X, UR, buff=0.05)
        self.play(FadeIn(X, lx))
        s1 = arrow(p, (0, 0), 3 * b1, C1, 7)
        s2 = arrow(p, 3 * b1, x, C2, 7)
        self.play(GrowArrow(s1))
        self.play(GrowArrow(s2))
        eq = boxed(MathTex(r"\mathbf x = 3\,\mathbf y + 1\,\mathbf z \quad\Rightarrow\quad [\mathbf x]_{[\mathbf y, \mathbf z]} = (3, 1)^T", font_size=36)).to_corner(UL).shift(DOWN * 0.9)
        self.play(FadeIn(eq))
        self.wait(1)
        fin = boxed(Tex(r"Leon §3.5 Example 1. Any basis of $\mathbb R^2$ has exactly 2 vectors: $\dim \mathbb R^2 = 2$", font_size=30, color=C3)).to_edge(DOWN, buff=0.3)
        self.play(FadeIn(fin))
        self.wait(2)


# =================================================================
# 3.5  Change of basis: the transition matrix
# =================================================================
class ChangeOfBasis(Scene):
    def construct(self):
        self.add(title(r"Change of basis: coordinates convert by a transition matrix"))
        U = mat([[2, 1], [1, 4]], scale=0.85)
        U.get_columns()[0].set_color(C1); U.get_columns()[1].set_color(C2)
        c = mat([[3], [1]], scale=0.85)
        x = mat([[7], [7]], scale=0.85)
        row1 = VGroup(MathTex(r"\mathbf x =", font_size=40), x, MathTex("=", font_size=40), U, c).arrange(RIGHT, buff=0.25).shift(UP * 1.3)
        cap1 = VGroup(Tex(r"standard coordinates", font_size=26, color=MUTE).next_to(x, DOWN),
                      Tex(r"$U = (\mathbf y\ \mathbf z)$", font_size=26, color=MUTE).next_to(U, DOWN),
                      Tex(r"$[\mathbf x]_{[\mathbf y,\mathbf z]}$", font_size=26, color=MUTE).next_to(c, DOWN))
        self.play(FadeIn(row1), FadeIn(cap1))
        a1 = Tex(r"From $[\mathbf y, \mathbf z]$-coordinates to standard ones: multiply by $U$.", font_size=32).shift(DOWN * 0.4)
        self.play(Write(a1))
        self.wait(1)
        Ui = mat([[r"\tfrac47", r"-\tfrac17"], [r"-\tfrac17", r"\tfrac27"]], scale=0.85)
        row2 = VGroup(MathTex(r"[\mathbf x]_{[\mathbf y, \mathbf z]} = U^{-1}\mathbf x =", font_size=40), Ui, mat([[7], [7]], scale=0.85), MathTex("=", font_size=40), mat([[3], [1]], scale=0.85)).arrange(RIGHT, buff=0.25).shift(DOWN * 1.6)
        a2 = Tex(r"Back again: multiply by the inverse, the transition matrix from $[\mathbf e_1, \mathbf e_2]$ to $[\mathbf y, \mathbf z]$.", font_size=30, color=C1).next_to(row2, DOWN, buff=0.35)
        self.play(FadeIn(row2))
        self.play(Write(a2))
        self.wait(1)
        fin = boxed(Tex(r"Between two bases $U$ and $V$: the transition matrix from $U$ to $V$ is $V^{-1}U$", font_size=32, color=C3)).to_edge(DOWN, buff=0.25)
        self.play(FadeTransform(a2, fin))
        self.wait(2)


# =================================================================
# 3.6  Rank and nullity
# =================================================================
class RankNullity(ThreeDScene):
    def construct(self):
        self.set_camera_orientation(phi=65 * DEGREES, theta=-50 * DEGREES, zoom=0.85)
        axes = ThreeDAxes(x_range=[-3, 3], y_range=[-3, 3], z_range=[-3, 3], x_length=6, y_length=6, z_length=5,
                          axis_config={"color": MUTE, "stroke_width": 2})
        t = title(r"Rank--nullity: $\mathrm{rank}(A) + \dim N(A) = n$")
        self.add_fixed_in_frame_mobjects(t)
        self.add(axes)
        A = np.array([[1, 0, 1], [0, 1, 1], [1, 1, 2]], dtype=float)  # rank 2, null space span (1,1,-1)
        pts = VGroup()
        rng = np.linspace(-1.2, 1.2, 5)
        for a in rng:
            for b in rng:
                for c in rng:
                    pts.add(Dot(axes.c2p(a, b, c), radius=0.035, color=C1))
        nl = VGroup(*[Dot(axes.c2p(s, s, -s), radius=0.06, color=WARN) for s in np.linspace(-1.5, 1.5, 9)])
        Am = boxed(MathTex(r"A = \begin{pmatrix}1&0&1\\0&1&1\\1&1&2\end{pmatrix}", font_size=34)).to_corner(UL).shift(DOWN * 0.8)
        self.add_fixed_in_frame_mobjects(Am); self.remove(Am)
        self.play(FadeIn(pts), FadeIn(nl), FadeIn(Am))
        n1 = boxed(Tex(r"red: the null space $N(A) = \mathrm{Span}\{(1, 1, -1)^T\}$", font_size=30, color=WARN)).to_edge(DOWN, buff=0.35)
        self.add_fixed_in_frame_mobjects(n1); self.remove(n1)
        self.play(FadeIn(n1))
        self.wait(1)
        M = np.zeros((3, 3)); M[:3, :3] = A
        self.play(ApplyMatrix(A, VGroup(pts, nl), about_point=axes.c2p(0, 0, 0)), run_time=3)
        n2 = boxed(Tex(r"$\mathbb R^3$ lands on a plane (column space, rank 2); the red line lands on $\mathbf 0$ (nullity 1)", font_size=30, color=C3)).to_edge(DOWN, buff=0.35)
        self.add_fixed_in_frame_mobjects(n2); self.remove(n2)
        self.play(FadeTransform(n1, n2))
        self.begin_ambient_camera_rotation(rate=0.3)
        self.wait(4)
        self.stop_ambient_camera_rotation()
        n3 = boxed(MathTex(r"2 + 1 = 3 = n", font_size=40, color=C3)).to_corner(UR).shift(DOWN * 0.8)
        self.add_fixed_in_frame_mobjects(n3); self.remove(n3)
        self.play(FadeIn(n3))
        self.wait(2)
