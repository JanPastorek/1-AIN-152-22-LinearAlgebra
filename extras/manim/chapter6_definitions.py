"""
Manim scenes for Chapter 6 (Eigenvalues) of
S. J. Leon, Linear Algebra with Applications (8th ed.).

Render:  manim -qm extras/manim/chapter6_definitions.py Eigenvectors
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from la_style import *  # noqa: E402,F401,F403


def arrow(p, a, b, color, w=6):
    return Arrow(p.c2p(*a), p.c2p(*b), buff=0, color=color, stroke_width=w, max_tip_length_to_length_ratio=0.18)


def lab_at(tex, point, direction, color, size=34):
    return MathTex(tex, color=color, font_size=size).next_to(point, direction, buff=0.08)


# =================================================================
# 6.1  Eigenvectors: directions that A only stretches
# =================================================================
class Eigenvectors(Scene):
    def construct(self):
        t = title(r"Eigenvectors: $A\mathbf x = \lambda\mathbf x$, the directions $A$ does not turn")
        tb = BackgroundRectangle(t, fill_color=BG, fill_opacity=0.95, buff=0.12)
        p = plane((-4.5, 4.5), (-3.5, 3.5)).scale(0.95).shift(LEFT * 2.6 + DOWN * 0.45)
        self.add(p, tb, t)
        A = np.array([[4.0, -2.0], [1.0, 1.0]])
        cap = boxed(MathTex(r"A = \begin{pmatrix}4 & -2\\ 1 & 1\end{pmatrix}", font_size=36)).to_corner(UR).shift(DOWN * 1.0 + LEFT * 0.3)
        self.play(FadeIn(cap))
        ang = ValueTracker(0.3)

        def xv():
            a = ang.get_value()
            return np.array([np.cos(a), np.sin(a)]) * 1.3

        circ = Circle(radius=1.3 * (p.c2p(1, 0)[0] - p.c2p(0, 0)[0]), color=MUTE, stroke_width=2).move_to(p.c2p(0, 0))
        self.play(Create(circ))
        xa = always_redraw(lambda: arrow(p, (0, 0), xv(), C1, 5))
        ax_ = always_redraw(lambda: arrow(p, (0, 0), A @ xv(), C2, 5))
        lx = always_redraw(lambda: lab_at(r"\mathbf x", p.c2p(*xv()), UR, C1, 30))
        lax = always_redraw(lambda: lab_at(r"A\mathbf x", p.c2p(*(A @ xv())), UR, C2, 30))
        self.play(GrowArrow(xa), GrowArrow(ax_), FadeIn(lx, lax))
        note = boxed(Tex(r"As $\mathbf x$ goes around the circle, $A\mathbf x$ usually points elsewhere \dots", font_size=30)).to_edge(DOWN, buff=0.3)
        self.play(FadeIn(note))
        self.play(ang.animate.set_value(0.3 + 2 * PI / 3), run_time=4, rate_func=linear)
        # first eigenvector (2,1) normalized: angle atan(1/2)
        a1 = np.arctan2(1, 2)
        self.play(ang.animate.set_value(a1 + PI), run_time=2.5)
        l1 = DashedLine(p.c2p(-4, -2), p.c2p(4, 2), color=AMB, stroke_width=3)
        e1 = boxed(MathTex(r"A(2,1)^T = (6,3)^T = 3\,(2,1)^T:\ \lambda_1 = 3", font_size=32, color=AMB)).to_edge(DOWN, buff=0.3)
        self.play(Create(l1), FadeTransform(note, e1))
        self.wait(1)
        a2 = np.arctan2(1, 1)
        self.play(ang.animate.set_value(a2 + 2 * PI), run_time=3)
        l2 = DashedLine(p.c2p(-3.2, -3.2), p.c2p(3.2, 3.2), color=C3, stroke_width=3)
        e2 = boxed(MathTex(r"A(1,1)^T = (2,2)^T = 2\,(1,1)^T:\ \lambda_2 = 2", font_size=32, color=C3)).to_edge(DOWN, buff=0.3)
        self.play(Create(l2), FadeTransform(e1, e2))
        self.wait(1)
        cp = boxed(VGroup(MathTex(r"\det(A - \lambda I) = \lambda^2 - 5\lambda + 6", font_size=32),
                          MathTex(r"= (\lambda - 2)(\lambda - 3)", font_size=32),
                          MathTex(r"\lambda_1 + \lambda_2 = \mathrm{tr}A = 5,\ \ \lambda_1\lambda_2 = \det A = 6", font_size=28, color=C3)).arrange(DOWN, aligned_edge=LEFT)).next_to(cap, DOWN, buff=0.3).align_to(cap, RIGHT)
        self.play(FadeIn(cp))
        fin = boxed(Tex(r"Eigenvalues are the roots of the characteristic polynomial; eigenvectors span $N(A - \lambda I)$", font_size=30, color=C3)).to_edge(DOWN, buff=0.3)
        self.play(FadeTransform(e2, fin))
        self.wait(2)


# =================================================================
# 6.2  Y' = AY: solutions along eigenvectors
# =================================================================
class PhasePortrait(Scene):
    def construct(self):
        t = title(r"$\mathbf Y' = A\mathbf Y$: each eigenpair gives a solution $e^{\lambda t}\mathbf x$")
        tb = BackgroundRectangle(t, fill_color=BG, fill_opacity=0.95, buff=0.12)
        p = plane((-4, 4), (-3, 3)).scale(1.0).shift(LEFT * 2.7 + DOWN * 0.5)
        self.add(p, tb, t)
        A = np.array([[-1.0, 2.0], [2.0, -1.0]])  # eigen 1 on (1,1), -3 on (1,-1)
        o = p.c2p(0, 0)
        u = p.c2p(1, 0)[0] - o[0]

        def field(pt):
            x = (pt - o) / u
            v = A @ x[:2]
            return np.array([v[0], v[1], 0]) * 0.25

        sl = StreamLines(field, x_range=[o[0] - 4 * u, o[0] + 4 * u, 0.5], y_range=[o[1] - 3 * u, o[1] + 3 * u, 0.5],
                         stroke_width=1.6, max_anchors_per_line=25, colors=[MUTE, C1], padding=0.5)
        cap = boxed(MathTex(r"A = \begin{pmatrix}-1 & 2\\ 2 & -1\end{pmatrix}", font_size=34)).to_corner(UR).shift(DOWN * 1.0 + LEFT * 0.3)
        self.play(FadeIn(cap))
        self.add(sl)
        sl.start_animation(warm_up=True, flow_speed=1.2)
        self.wait(2.5)
        l1 = Line(p.c2p(-3, -3), p.c2p(3, 3), color=AMB, stroke_width=4)
        l2 = Line(p.c2p(-3, 3), p.c2p(3, -3), color=C3, stroke_width=4)
        eq = boxed(VGroup(MathTex(r"\lambda_1 = 1,\ \mathbf x_1 = (1,1)^T", color=AMB, font_size=32),
                          MathTex(r"\lambda_2 = -3,\ \mathbf x_2 = (1,-1)^T", color=C3, font_size=32),
                          MathTex(r"\mathbf Y = c_1 e^{t}\mathbf x_1 + c_2 e^{-3t}\mathbf x_2", font_size=32)).arrange(DOWN, aligned_edge=LEFT)).next_to(cap, DOWN, buff=0.3).align_to(cap, RIGHT)
        self.play(Create(l1), Create(l2), FadeIn(eq[0], eq[1][:2]))
        self.wait(1)
        self.play(FadeIn(eq[1][2]))
        # one trajectory from Y0 = (3, 1): c = X^{-1} Y0 = (2, 1)
        c1, c2 = 2.0, 1.0
        path = ParametricFunction(lambda s: p.c2p(c1 * np.exp(s) + c2 * np.exp(-3 * s), c1 * np.exp(s) - c2 * np.exp(-3 * s)), t_range=[0, 0.4], color=WARN, stroke_width=5)
        dot = Dot(p.c2p(3, 1), color=WARN, radius=0.09)
        y0 = boxed(MathTex(r"\mathbf Y(0) = (3,1)^T = 2\mathbf x_1 + 1\,\mathbf x_2", font_size=30, color=WARN)).to_edge(DOWN, buff=0.3)
        self.play(FadeIn(dot), FadeIn(y0))
        self.play(Create(path), MoveAlongPath(dot, path), run_time=3)
        self.play(sl.end_animation())
        fin = boxed(Tex(r"Saddle: the $e^{-3t}$ part dies out and $\mathbf Y(t)$ approaches the line of $\mathbf x_1$ (Exercise 6.2.2(a))", font_size=28, color=C3)).to_edge(DOWN, buff=0.3)
        self.play(FadeTransform(y0, fin))
        self.wait(2)


# =================================================================
# 6.3  Diagonalization: A = X D X^{-1}
# =================================================================
class Diagonalization(Scene):
    def construct(self):
        t = title(r"Diagonalization: $A = XDX^{-1}$, so $A^k = XD^kX^{-1}$")
        tb = BackgroundRectangle(t, fill_color=BG, fill_opacity=0.95, buff=0.12)
        p = plane((-6, 6), (-4, 4)).scale(0.6).shift(LEFT * 3.4 + DOWN * 0.5)
        self.add(p, tb, t)
        A = np.array([[2.0, -3.0], [2.0, -5.0]])
        X = np.array([[3.0, 1.0], [1.0, 2.0]])
        D = np.diag([1.0, -4.0])
        o = p.c2p(0, 0)
        eqs = VGroup(MathTex(r"A = \begin{pmatrix}2 & -3\\ 2 & -5\end{pmatrix}", font_size=34),
                     MathTex(r"\mathbf x_1 = (3,1)^T,\ \lambda_1 = 1", font_size=32, color=C1),
                     MathTex(r"\mathbf x_2 = (1,2)^T,\ \lambda_2 = -4", font_size=32, color=C2)).arrange(DOWN, aligned_edge=LEFT, buff=0.25)
        eqs.shift((p.get_right()[0] + 0.5 - eqs.get_left()[0]) * RIGHT + (2.0 - eqs.get_center()[1]) * UP)
        self.play(FadeIn(eqs[0]))
        grid = VGroup()
        for c1 in range(-2, 3):
            grid.add(Line(p.c2p(*(c1 * X[:, 0] - 0.5 * X[:, 1])), p.c2p(*(c1 * X[:, 0] + 0.5 * X[:, 1])), color=C2, stroke_opacity=0.5, stroke_width=1.5))
        for c2 in (-0.5, -0.25, 0, 0.25, 0.5):
            grid.add(Line(p.c2p(*(-2 * X[:, 0] + c2 * X[:, 1])), p.c2p(*(2 * X[:, 0] + c2 * X[:, 1])), color=C1, stroke_opacity=0.5, stroke_width=1.5))
        a1, a2 = arrow(p, (0, 0), X[:, 0], C1, 6), arrow(p, (0, 0), 0.5 * X[:, 1], C2, 6)
        self.play(Create(grid), GrowArrow(a1), GrowArrow(a2), FadeIn(eqs[1:]))
        step = boxed(Tex(r"In the eigenvector grid, $A$ just scales: by $1$ along $\mathbf x_1$, by $-4$ along $\mathbf x_2$", font_size=30)).to_edge(DOWN, buff=0.3)
        self.play(FadeIn(step))
        self.play(ApplyMatrix(A, grid, about_point=o), Transform(a1, arrow(p, (0, 0), A @ X[:, 0], C1, 6)), Transform(a2, arrow(p, (0, 0), A @ (0.5 * X[:, 1]), C2, 6)), run_time=3)
        self.wait(1)
        fac = MathTex(r"X^{-1}AX = \begin{pmatrix}1 & 0\\ 0 & -4\end{pmatrix} = D", font_size=36, color=C3).next_to(eqs, DOWN, buff=0.45).align_to(eqs, LEFT)
        self.play(Write(fac))
        pw = MathTex(r"A^k = X\begin{pmatrix}1 & 0\\ 0 & (-4)^k\end{pmatrix}X^{-1}", font_size=34).next_to(fac, DOWN, buff=0.35).align_to(eqs, LEFT)
        self.play(Write(pw))
        fin = boxed(Tex(r"Diagonalizable $\iff$ $n$ linearly independent eigenvectors (Theorem 6.3.2); Leon \S6.3 Example 1", font_size=28, color=C3)).to_edge(DOWN, buff=0.3)
        self.play(FadeTransform(step, fin))
        self.wait(2)


# =================================================================
# 6.3  Markov chains: x_{k+1} = A x_k approaches the steady state
# =================================================================
class MarkovSteadyState(Scene):
    def construct(self):
        t = title(r"Markov chains: $\mathbf x_{k+1} = A\mathbf x_k$ tends to the eigenvector for $\lambda = 1$")
        self.add(t)
        A = np.array([[0.7, 0.2], [0.3, 0.8]])
        Am = MathTex(r"A = \begin{pmatrix}0.7 & 0.2\\ 0.3 & 0.8\end{pmatrix}", font_size=36).to_corner(UL).shift(DOWN * 1.1 + RIGHT * 0.2)
        lab = Tex(r"Example 6.1.1: married / single,\\in thousands", font_size=28, color=MUTE).next_to(Am, DOWN, aligned_edge=LEFT)
        self.play(FadeIn(Am), FadeIn(lab))
        ax = Axes(x_range=[0, 2, 1], y_range=[0, 10, 2], x_length=4, y_length=4.4, axis_config={"color": MUTE}).shift(RIGHT * 2.6 + DOWN * 0.6)
        self.play(Create(ax))
        x = np.array([8.0, 2.0])
        k = ValueTracker(0)

        def bars():
            g = VGroup()
            for i, (v, c) in enumerate(zip(state[0], (C1, C2))):
                r = Rectangle(width=1.2, height=max(0.001, v / 10 * 4.4), fill_color=c, fill_opacity=0.8, stroke_width=0)
                r.move_to(ax.c2p(0.5 + i, 0), aligned_edge=DOWN)
                g.add(r)
                g.add(MathTex(f"{v:.3f}", font_size=28, color=c).next_to(r, UP, buff=0.08))
            return g

        state = [x.copy()]
        g = bars()
        names = VGroup(Tex("married", font_size=26).next_to(ax.c2p(0.5, 0), DOWN), Tex("single", font_size=26).next_to(ax.c2p(1.5, 0), DOWN))
        kl = MathTex(r"k = 0", font_size=34).next_to(lab, DOWN, buff=0.5).align_to(lab, LEFT)
        self.play(FadeIn(g), FadeIn(names), FadeIn(kl))
        for step in range(1, 9):
            state[0] = A @ state[0]
            ng = bars()
            nk = MathTex(f"k = {step}", font_size=34).move_to(kl, aligned_edge=LEFT)
            self.play(Transform(g, ng), Transform(kl, nk), run_time=0.7)
        ss = boxed(VGroup(MathTex(r"A\mathbf x = \mathbf x \Rightarrow \mathbf x = (4, 6)^T", font_size=34, color=C3),
                          MathTex(r"\lambda_2 = 0.5:\ \text{that part shrinks by half each year}", font_size=28))
                   .arrange(DOWN, aligned_edge=LEFT)).next_to(kl, DOWN, buff=0.4).align_to(kl, LEFT)
        self.play(FadeIn(ss))
        fin = boxed(Tex(r"A stochastic matrix has $\lambda_1 = 1$; if it is dominant, every start converges to the steady state (Theorem 6.3.4)", font_size=27, color=C3)).to_edge(DOWN, buff=0.25)
        self.play(FadeIn(fin))
        self.wait(2)


# =================================================================
# 6.5  SVD: the unit circle becomes an ellipse
# =================================================================
class SVDGeometry(Scene):
    def construct(self):
        t = title(r"SVD: $A = U\Sigma V^T$ turns the unit circle into an ellipse")
        tb = BackgroundRectangle(t, fill_color=BG, fill_opacity=0.95, buff=0.12)
        p = plane((-4, 4), (-3.2, 3.2)).scale(0.95).shift(LEFT * 3.1 + DOWN * 0.5)
        self.add(p, tb, t)
        A = np.array([[3.0, 0.0], [4.0, 5.0]])
        Uu, s, Vt = np.linalg.svd(A)
        V = Vt.T
        if np.linalg.det(V) < 0:
            V[:, 1] *= -1
            Uu[:, 1] *= -1
        o = p.c2p(0, 0)
        unit = p.c2p(1, 0)[0] - o[0]
        circ = Circle(radius=unit * 1.0, color=INK, stroke_width=3).move_to(o)
        v1, v2 = arrow(p, (0, 0), V[:, 0], C1, 6), arrow(p, (0, 0), V[:, 1], C2, 6)
        cap = boxed(MathTex(r"A = \begin{pmatrix}3 & 0\\ 4 & 5\end{pmatrix}", font_size=34)).to_corner(UR).shift(DOWN * 1.0 + LEFT * 0.3)
        self.play(FadeIn(cap), Create(circ), GrowArrow(v1), GrowArrow(v2))
        st = VGroup(MathTex(r"\mathbf v_1, \mathbf v_2:\ \text{orthonormal, eigenvectors of } A^TA", font_size=28),
                    MathTex(r"\sigma_1 = 3\sqrt5,\ \sigma_2 = \sqrt5", font_size=30, color=AMB),
                    MathTex(r"A\mathbf v_i = \sigma_i \mathbf u_i", font_size=32, color=C3)).arrange(DOWN, aligned_edge=LEFT, buff=0.25).next_to(cap, DOWN, buff=0.35).align_to(cap, RIGHT)
        self.play(FadeIn(st[0]))
        grp = VGroup(circ, v1, v2)
        self.play(ApplyMatrix(Vt, grp, about_point=o), run_time=2)
        n1 = boxed(Tex(r"$V^T$: rotate $\mathbf v_1, \mathbf v_2$ onto the axes", font_size=30)).to_edge(DOWN, buff=0.3)
        self.play(FadeIn(n1))
        self.play(ApplyMatrix(np.diag(s / 2.5), grp, about_point=o), FadeIn(st[1]), run_time=2)
        n2 = boxed(Tex(r"$\Sigma$: stretch the axes by $\sigma_1, \sigma_2$ (drawn at scale $1/2.5$)", font_size=30)).to_edge(DOWN, buff=0.3)
        self.play(FadeTransform(n1, n2))
        self.play(ApplyMatrix(Uu, grp, about_point=o), FadeIn(st[2]), run_time=2)
        n3 = boxed(Tex(r"$U$: rotate onto $\mathbf u_1, \mathbf u_2$; the ellipse has semi-axes $\sigma_1\mathbf u_1$, $\sigma_2\mathbf u_2$", font_size=30, color=C3)).to_edge(DOWN, buff=0.3)
        self.play(FadeTransform(n2, n3))
        self.wait(2)


# =================================================================
# 6.6  Quadratic forms: principal axes
# =================================================================
class QuadraticForm(Scene):
    def construct(self):
        t = title(r"Quadratic forms: rotate to the eigenvectors and the $xy$ term disappears")
        tb = BackgroundRectangle(t, fill_color=BG, fill_opacity=0.95, buff=0.12)
        p = plane((-3.5, 3.5), (-2.8, 2.8)).scale(1.0).shift(LEFT * 3.0 + DOWN * 0.5)
        self.add(p, tb, t)
        eq = MathTex(r"3x^2 + 2xy + 3y^2 = 8", font_size=38)
        eq.shift((p.get_right()[0] + 0.45 - eq.get_left()[0]) * RIGHT + (2.4 - eq.get_center()[1]) * UP)
        self.play(Write(eq))
        mat_ = MathTex(r"\mathbf x^TA\mathbf x = 8,\ \ A = \begin{pmatrix}3 & 1\\ 1 & 3\end{pmatrix}", font_size=34).next_to(eq, DOWN, buff=0.35).align_to(eq, LEFT)
        self.play(Write(mat_))
        curve = ParametricFunction(lambda s: p.c2p(*(np.sqrt(2) * np.cos(s) * np.array([1, 1]) / np.sqrt(2) + 2 * np.sin(s) * np.array([-1, 1]) / np.sqrt(2))), t_range=[0, 2 * PI], color=C1, stroke_width=5)
        self.play(Create(curve), run_time=2)
        ev = VGroup(MathTex(r"\lambda_1 = 4,\ \mathbf x_1 = \tfrac1{\sqrt2}(1, 1)^T", font_size=32, color=AMB),
                    MathTex(r"\lambda_2 = 2,\ \mathbf x_2 = \tfrac1{\sqrt2}(-1, 1)^T", font_size=32, color=C3)).arrange(DOWN, aligned_edge=LEFT).next_to(mat_, DOWN, buff=0.4).align_to(eq, LEFT)
        a1 = DashedLine(p.c2p(-2.6, -2.6), p.c2p(2.6, 2.6), color=AMB, stroke_width=3)
        a2 = DashedLine(p.c2p(2.4, -2.4), p.c2p(-2.4, 2.4), color=C3, stroke_width=3)
        self.play(Create(a1), Create(a2), FadeIn(ev))
        rot = VGroup(curve, a1, a2)
        self.play(Rotate(rot, -PI / 4, about_point=p.c2p(0, 0)), run_time=2.5)
        std = MathTex(r"4x'^2 + 2y'^2 = 8 \iff \frac{x'^2}{2} + \frac{y'^2}{4} = 1", font_size=30, color=C1).next_to(ev, DOWN, buff=0.45).align_to(eq, LEFT)
        self.play(Write(std))
        cls = MathTex(r"\lambda_1, \lambda_2 > 0:\ \text{positive definite, an ellipse}", font_size=28, color=C3).next_to(std, DOWN, buff=0.35).align_to(eq, LEFT)
        self.play(Write(cls))
        fin = boxed(Tex(r"Principal Axes Theorem: with $\mathbf x = Q\mathbf y$, $Q$ orthogonal, $\mathbf x^TA\mathbf x = \lambda_1y_1^2 + \dots + \lambda_ny_n^2$ (Leon \S6.6 Example 2)", font_size=27, color=C3)).to_edge(DOWN, buff=0.25)
        self.play(FadeIn(fin))
        self.wait(2)
