"""
Manim scenes for Chapter 5 (Orthogonality) of
S. J. Leon, Linear Algebra with Applications (8th ed.).

Render:  manim -qm extras/manim/chapter5_definitions.py GramSchmidt
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from la_style import *  # noqa: E402,F401,F403


def arrow(p, a, b, color, w=6):
    return Arrow(p.c2p(*a), p.c2p(*b), buff=0, color=color, stroke_width=w, max_tip_length_to_length_ratio=0.18)


def lab_at(tex, point, direction, color, size=34):
    return MathTex(tex, color=color, font_size=size).next_to(point, direction, buff=0.08)


def right_angle(p, at, d1, d2, size=0.28, color=INK):
    """Small square marking a right angle at data point `at` between unit directions d1, d2 (data coords)."""
    d1, d2 = np.array(d1, float), np.array(d2, float)
    d1, d2 = d1 / np.linalg.norm(d1), d2 / np.linalg.norm(d2)
    s = size / p.x_axis.get_unit_size() if hasattr(p, "x_axis") else size
    a = np.array(at, float)
    pts = [a + s * d1, a + s * (d1 + d2), a + s * d2]
    return VMobject(color=color, stroke_width=2).set_points_as_corners([p.c2p(*q) for q in pts])


# =================================================================
# 5.1  Scalar product, angle, projection
# =================================================================
class ScalarProjection(Scene):
    def construct(self):
        t = title(r"Scalar product and projection: $\mathbf x^T\mathbf y = \|\mathbf x\|\,\|\mathbf y\|\cos\theta$")
        p = plane((-1, 7), (-1, 6)).scale(0.95).shift(LEFT * 3.0 + DOWN * 0.55)
        self.add(p, t)
        x, y = np.array([3.0, 5.0]), np.array([1.0, 1.0])
        ax, ay = arrow(p, (0, 0), x, C1), arrow(p, (0, 0), (5, 5), C2, 4)
        line = DashedLine(p.c2p(-1, -1), p.c2p(6, 6), color=C2, stroke_width=2, dash_length=0.1)
        self.play(GrowArrow(ax), FadeIn(lab_at(r"\mathbf x = (3,5)^T", ax.get_end(), UL, C1, 32)))
        self.play(Create(line), GrowArrow(ay), FadeIn(lab_at(r"\mathbf y = (1,1)^T \text{ direction}", ay.get_end(), RIGHT, C2, 28)))
        th = Angle(Line(p.c2p(0, 0), p.c2p(5, 5)), Line(p.c2p(0, 0), p.c2p(*x)), radius=0.8, color=AMB)
        self.play(Create(th), FadeIn(MathTex(r"\theta", color=AMB, font_size=32).move_to(p.c2p(0.95, 1.4))))
        eqs = VGroup(
            MathTex(r"\mathbf x^T\mathbf y = 3 + 5 = 8", font_size=34),
            MathTex(r"\cos\theta = \frac{\mathbf x^T\mathbf y}{\|\mathbf x\|\|\mathbf y\|} = \frac{8}{\sqrt{34}\sqrt 2}", font_size=34),
            MathTex(r"\alpha = \frac{\mathbf x^T\mathbf y}{\|\mathbf y\|} = 4\sqrt2 \ \text{(scalar projection)}", font_size=32),
            MathTex(r"\mathbf p = \frac{\mathbf x^T\mathbf y}{\mathbf y^T\mathbf y}\,\mathbf y = 4\,\mathbf y = (4, 4)^T", font_size=34, color=AMB),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.32).to_edge(RIGHT, buff=0.4).shift(UP * 0.6)
        self.play(Write(eqs[0]))
        self.play(Write(eqs[1]))
        self.play(Write(eqs[2]))
        drop = DashedLine(p.c2p(*x), p.c2p(4, 4), color=INK, stroke_width=3)
        self.play(Create(drop))
        pv = arrow(p, (0, 0), (4, 4), AMB, 7)
        self.play(GrowArrow(pv), Write(eqs[3]))
        ra = right_angle(p, (4, 4), (-1, 1), (-1, -1))
        z = arrow(p, (4, 4), x, WARN, 5)
        self.play(Create(ra), GrowArrow(z), FadeIn(lab_at(r"\mathbf x - \mathbf p", z.get_center(), RIGHT, WARN, 30)))
        fin = boxed(Tex(r"$\mathbf x - \mathbf p = (-1, 1)^T$ is orthogonal to $\mathbf y$: \ $\mathbf x = \mathbf p + (\mathbf x - \mathbf p)$", font_size=30, color=C3)).to_edge(DOWN, buff=0.3)
        self.play(FadeIn(fin))
        self.wait(2)


# =================================================================
# 5.2  Orthogonal complements: N(A) = R(A^T)^perp
# =================================================================
class OrthogonalComplement(ThreeDScene):
    def construct(self):
        self.set_camera_orientation(phi=68 * DEGREES, theta=-40 * DEGREES, zoom=0.85)
        axes = ThreeDAxes(x_range=[-3, 3], y_range=[-3, 3], z_range=[-3, 3], x_length=6, y_length=6, z_length=5,
                          axis_config={"color": MUTE, "stroke_width": 2})
        t = title(r"Orthogonal complement: $N(A) = R(A^T)^{\perp}$")
        self.add_fixed_in_frame_mobjects(t)
        self.add(axes)
        r1, r2 = np.array([1.0, 0, -1]), np.array([0, 1.0, 1])
        n = np.cross(r1, r2)  # (1, -1, 1)
        Am = boxed(MathTex(r"A = \begin{pmatrix}1&0&-1\\0&1&1\end{pmatrix}", font_size=34)).to_corner(UL).shift(DOWN * 0.8)
        self.add_fixed_in_frame_mobjects(Am); self.remove(Am)
        self.play(FadeIn(Am))
        plane_ = Surface(lambda u, v: axes.c2p(*(u * r1 + v * r2)), u_range=[-2, 2], v_range=[-2, 2], resolution=(8, 8),
                         fill_color=C1, fill_opacity=0.35, stroke_color=C1, stroke_width=0.6, checkerboard_colors=[C1, C1])
        a1 = Arrow3D(axes.c2p(0, 0, 0), axes.c2p(*r1), color=C1)
        a2 = Arrow3D(axes.c2p(0, 0, 0), axes.c2p(*r2), color=C1)
        self.play(Create(a1), Create(a2))
        self.play(FadeIn(plane_))
        c1 = boxed(Tex(r"blue: the row space $R(A^T) = \mathrm{Span}$(rows of $A$)", font_size=30, color=C1)).to_edge(DOWN, buff=0.35)
        self.add_fixed_in_frame_mobjects(c1); self.remove(c1)
        self.play(FadeIn(c1))
        nl = Line3D(axes.c2p(*(-2.2 * n / np.linalg.norm(n))), axes.c2p(*(2.2 * n / np.linalg.norm(n))), color=WARN, thickness=0.03)
        nv = Arrow3D(axes.c2p(0, 0, 0), axes.c2p(*n), color=WARN)
        self.play(Create(nl), Create(nv))
        c2 = boxed(Tex(r"red: $N(A) = \mathrm{Span}\{(1,-1,1)^T\}$; \ $A\mathbf x = \mathbf 0$ says $\mathbf x$ is orthogonal to every row", font_size=30, color=WARN)).to_edge(DOWN, buff=0.35)
        self.add_fixed_in_frame_mobjects(c2); self.remove(c2)
        self.play(FadeTransform(c1, c2))
        self.begin_ambient_camera_rotation(rate=0.35)
        self.wait(4)
        self.stop_ambient_camera_rotation()
        c3 = boxed(Tex(r"$\dim R(A^T) + \dim N(A) = 2 + 1 = 3$, and $\mathbb R^3 = R(A^T) \oplus N(A)$", font_size=32, color=C3)).to_edge(DOWN, buff=0.35)
        self.add_fixed_in_frame_mobjects(c3); self.remove(c3)
        self.play(FadeTransform(c2, c3))
        self.wait(2)


# =================================================================
# 5.3  Least squares: the best line, and the normal equations
# =================================================================
class LeastSquares(Scene):
    def construct(self):
        t = title(r"Least squares: minimize $\|\mathbf b - A\mathbf x\|$; solve $A^TA\hat{\mathbf x} = A^T\mathbf b$")
        p = Axes(x_range=[-1, 7, 1], y_range=[-1, 6, 1], x_length=6.0, y_length=5.0, axis_config={"color": MUTE, "include_ticks": True}).shift(LEFT * 3.3 + DOWN * 0.6)
        self.add(p, t)
        data = [(0, 1), (3, 4), (6, 5)]
        dots = VGroup(*[Dot(p.c2p(a, b), color=C2, radius=0.09) for a, b in data])
        self.play(FadeIn(dots))
        X0 = p.get_right()[0] + 0.6

        def at_left(m):
            return m.shift((X0 - m.get_left()[0]) * RIGHT)

        tab = at_left(MathTex(r"\begin{array}{c|ccc} x & 0 & 3 & 6 \\ y & 1 & 4 & 5\end{array}", font_size=34).shift(UP * 2.3))
        self.play(FadeIn(tab))
        sysm = MathTex(r"\begin{pmatrix}1&0\\1&3\\1&6\end{pmatrix}\begin{pmatrix}c_0\\c_1\end{pmatrix} \approx \begin{pmatrix}1\\4\\5\end{pmatrix}", font_size=32).next_to(tab, DOWN, buff=0.35)
        at_left(sysm)
        self.play(Write(sysm))
        c0, c1 = ValueTracker(0.5), ValueTracker(1.0)
        line = always_redraw(lambda: Line(p.c2p(-0.5, c0.get_value() - 0.5 * c1.get_value()), p.c2p(6.8, c0.get_value() + 6.8 * c1.get_value()), color=C1, stroke_width=4))
        res = always_redraw(lambda: VGroup(*[Line(p.c2p(a, b), p.c2p(a, c0.get_value() + c1.get_value() * a), color=WARN, stroke_width=4) for a, b in data]))
        rn = always_redraw(lambda: MathTex(r"\|\mathbf r\|^2 = %.3f" % sum((b - c0.get_value() - c1.get_value() * a) ** 2 for a, b in data), font_size=32, color=WARN).next_to(sysm, DOWN, buff=0.35).align_to(sysm, LEFT))
        self.play(Create(line), Create(res), FadeIn(rn))
        self.play(c1.animate.set_value(0.3), c0.animate.set_value(2.5), run_time=2)
        self.play(c1.animate.set_value(0.8), c0.animate.set_value(0.6), run_time=2)
        ne = MathTex(r"A^TA = \begin{pmatrix}3&9\\9&45\end{pmatrix},\ A^T\mathbf y = \begin{pmatrix}10\\42\end{pmatrix}", font_size=30).next_to(rn, DOWN, buff=0.35).align_to(sysm, LEFT)
        self.play(Write(ne))
        self.play(c0.animate.set_value(4 / 3), c1.animate.set_value(2 / 3), run_time=2.5)
        best = MathTex(r"\hat c = (\tfrac43, \tfrac23):\ y = \tfrac43 + \tfrac23 x", font_size=34, color=C1).next_to(ne, DOWN, buff=0.3).align_to(sysm, LEFT)
        self.play(Write(best))
        fin = boxed(Tex(r"The residual $\mathbf r = \mathbf y - A\hat{\mathbf c}$ is orthogonal to the columns of $A$: $A^T\mathbf r = \mathbf 0$ (Leon \S5.3 Example 2)", font_size=28, color=C3)).to_edge(DOWN, buff=0.25)
        self.play(FadeIn(fin))
        self.wait(2)


# =================================================================
# 5.4  Norms: unit balls of the 1-, 2- and infinity-norms
# =================================================================
class Norms(Scene):
    def construct(self):
        t = title(r"Norms: three ways to measure length in $\mathbb R^2$")
        p = plane((-2, 2), (-2, 2)).scale(1.45).shift(LEFT * 3.2 + DOWN * 0.45)
        self.add(p, t)
        o = p.c2p(0, 0)
        u = p.c2p(1, 0)[0] - o[0]
        diamond = Polygon(p.c2p(1, 0), p.c2p(0, 1), p.c2p(-1, 0), p.c2p(0, -1), color=C2, stroke_width=4)
        circ = Circle(radius=u, color=C1, stroke_width=4).move_to(o)
        sq = Square(side_length=2 * u, color=C3, stroke_width=4).move_to(o)
        defs = VGroup(
            MathTex(r"\|\mathbf x\|_1 = |x_1| + |x_2|", color=C2, font_size=36),
            MathTex(r"\|\mathbf x\|_2 = (x_1^2 + x_2^2)^{1/2}", color=C1, font_size=36),
            MathTex(r"\|\mathbf x\|_\infty = \max(|x_1|, |x_2|)", color=C3, font_size=36),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        defs.shift((p.get_right()[0] + 0.5 - defs.get_left()[0]) * RIGHT + (1.55 - defs.get_center()[1]) * UP)
        cap = Tex(r"unit balls $\{\mathbf x : \|\mathbf x\| = 1\}$", font_size=30, color=MUTE).next_to(defs, UP, buff=0.3).align_to(defs, LEFT)
        self.play(FadeIn(cap))
        for shape, d in ((diamond, defs[0]), (circ, defs[1]), (sq, defs[2])):
            self.play(Create(shape), Write(d))
        pt = np.array([0.8, -0.6])
        dot = Dot(p.c2p(*pt), color=AMB, radius=0.08)
        vals = MathTex(r"\mathbf x = (0.8, -0.6):\\ \|\mathbf x\|_1 = 1.4,\ \|\mathbf x\|_2 = 1,\ \|\mathbf x\|_\infty = 0.8", font_size=30, color=AMB).next_to(defs, DOWN, buff=0.5).align_to(defs, LEFT)
        self.play(FadeIn(dot), Write(vals))
        self.wait(1)
        ex = MathTex(r"\text{Example 5: } \mathbf x = (4,-5,3)^T:\\ \|\mathbf x\|_1 = 12,\ \|\mathbf x\|_2 = 5\sqrt2,\ \|\mathbf x\|_\infty = 5", font_size=30).next_to(vals, DOWN, buff=0.4).align_to(defs, LEFT)
        self.play(Write(ex))
        fin = boxed(Tex(r"Every norm: $\|\mathbf x\| \ge 0$ with equality only for $\mathbf 0$; $\|\alpha\mathbf x\| = |\alpha|\,\|\mathbf x\|$; $\|\mathbf x + \mathbf y\| \le \|\mathbf x\| + \|\mathbf y\|$", font_size=28, color=C3)).to_edge(DOWN, buff=0.25)
        self.play(FadeIn(fin))
        self.wait(2)


# =================================================================
# 5.5  Orthonormal basis: coordinates are inner products
# =================================================================
class OrthonormalCoordinates(Scene):
    def construct(self):
        t = title(r"Orthonormal basis: the coordinates are $c_i = \langle \mathbf x, \mathbf u_i\rangle$")
        p = plane((-3, 4), (-2, 3.5)).scale(1.05).shift(LEFT * 3.1 + DOWN * 0.55)
        self.add(p, t)
        u1, u2 = np.array([0.6, 0.8]), np.array([-0.8, 0.6])
        x = np.array([2.0, 1.0])
        A1, A2 = arrow(p, (0, 0), u1, C1), arrow(p, (0, 0), u2, C2)
        l1 = DashedLine(p.c2p(*(-2.5 * u1)), p.c2p(*(4 * u1)), color=C1, stroke_width=2, dash_length=0.1)
        l2 = DashedLine(p.c2p(*(-2.5 * u2)), p.c2p(*(2.5 * u2)), color=C2, stroke_width=2, dash_length=0.1)
        self.play(Create(l1), Create(l2), GrowArrow(A1), GrowArrow(A2),
                  FadeIn(lab_at(r"\mathbf u_1 = (\tfrac35, \tfrac45)", A1.get_end(), UL, C1, 28), lab_at(r"\mathbf u_2 = (-\tfrac45, \tfrac35)", A2.get_end(), LEFT, C2, 28)))
        X = arrow(p, (0, 0), x, AMB, 6)
        self.play(GrowArrow(X), FadeIn(lab_at(r"\mathbf x = (2, 1)", X.get_end(), RIGHT, AMB, 30)))
        c1, c2 = x @ u1, x @ u2  # 2, -1
        d1 = DashedLine(p.c2p(*x), p.c2p(*(c1 * u1)), color=INK, stroke_width=2.5)
        d2 = DashedLine(p.c2p(*x), p.c2p(*(c2 * u2)), color=INK, stroke_width=2.5)
        eq = VGroup(
            MathTex(r"c_1 = \mathbf x^T\mathbf u_1 = \tfrac65 + \tfrac45 = 2", font_size=34, color=C1),
            MathTex(r"c_2 = \mathbf x^T\mathbf u_2 = -\tfrac85 + \tfrac35 = -1", font_size=34, color=C2),
            MathTex(r"\mathbf x = 2\,\mathbf u_1 - 1\,\mathbf u_2", font_size=36),
            MathTex(r"\|\mathbf x\|^2 = c_1^2 + c_2^2 = 5 \quad \text{(Parseval)}", font_size=32),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.32).to_edge(RIGHT, buff=0.4).shift(UP * 0.7)
        self.play(Create(d1), Write(eq[0]))
        self.play(Create(d2), Write(eq[1]))
        s1 = arrow(p, (0, 0), c1 * u1, C1, 8)
        s2 = arrow(p, c1 * u1, x, C2, 6)
        self.play(GrowArrow(s1))
        self.play(GrowArrow(s2), Write(eq[2]))
        self.play(Write(eq[3]))
        fin = boxed(Tex(r"No linear system to solve: $Q = (\mathbf u_1\ \mathbf u_2)$ is orthogonal, $Q^{-1} = Q^T$, so $\mathbf c = Q^T\mathbf x$", font_size=30, color=C3)).to_edge(DOWN, buff=0.3)
        self.play(FadeIn(fin))
        self.wait(2)


# =================================================================
# 5.6  Gram-Schmidt
# =================================================================
class GramSchmidt(Scene):
    def construct(self):
        t = title(r"Gram--Schmidt: subtract projections, then normalize")
        p = plane((-2, 4), (-0.8, 4.5)).scale(1.0).shift(LEFT * 3.2 + DOWN * 0.75)
        self.add(p, t)
        a1, a2 = np.array([1.5, 2.0]), np.array([1.0, 3.0])
        A1, A2 = arrow(p, (0, 0), a1, C1, 5), arrow(p, (0, 0), a2, C2, 5)
        self.play(GrowArrow(A1), GrowArrow(A2), FadeIn(lab_at(r"\mathbf a_1", A1.get_end(), RIGHT, C1), lab_at(r"\mathbf a_2", A2.get_end(), UP, C2)))
        steps = VGroup(
            MathTex(r"r_{11} = \|\mathbf a_1\| = 2.5,\quad \mathbf q_1 = \mathbf a_1 / r_{11} = (0.6, 0.8)", font_size=30, color=C1),
            MathTex(r"r_{12} = \mathbf q_1^T\mathbf a_2 = 3,\quad \mathbf p_1 = r_{12}\mathbf q_1", font_size=30, color=AMB),
            MathTex(r"\mathbf a_2 - \mathbf p_1 = (-0.8, 0.6),\quad r_{22} = 1", font_size=30, color=WARN),
            MathTex(r"\mathbf q_2 = (\mathbf a_2 - \mathbf p_1)/r_{22}", font_size=30, color=C2),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.3).to_edge(RIGHT, buff=0.35).shift(UP * 1.2)
        q1 = np.array([0.6, 0.8])
        Q1 = arrow(p, (0, 0), q1, C1, 9)
        self.play(Write(steps[0]), FadeIn(Q1), FadeIn(lab_at(r"\mathbf q_1", Q1.get_end(), LEFT, C1, 30)))
        line = DashedLine(p.c2p(*(-0.5 * q1)), p.c2p(*(5.2 * q1)), color=C1, stroke_width=2, dash_length=0.1)
        p1 = 3 * q1
        drop = DashedLine(p.c2p(*a2), p.c2p(*p1), color=INK, stroke_width=2.5)
        P1 = arrow(p, (0, 0), p1, AMB, 6)
        self.play(Create(line), Create(drop))
        self.play(GrowArrow(P1), Write(steps[1]))
        resid = a2 - p1
        Rr = arrow(p, p1, a2, WARN, 6)
        self.play(GrowArrow(Rr), Write(steps[2]))
        moved = arrow(p, (0, 0), resid, WARN, 6)
        self.play(Transform(Rr, moved))
        Q2 = arrow(p, (0, 0), resid, C2, 9)
        self.play(FadeIn(Q2), Write(steps[3]), FadeIn(lab_at(r"\mathbf q_2", Q2.get_end(), LEFT, C2, 30)))
        qr = MathTex(r"A = \begin{pmatrix}1.5&1\\2&3\end{pmatrix} = \underbrace{\begin{pmatrix}0.6&-0.8\\0.8&0.6\end{pmatrix}}_{Q}\underbrace{\begin{pmatrix}2.5&3\\0&1\end{pmatrix}}_{R}", font_size=32).next_to(steps, DOWN, buff=0.45).align_to(steps, LEFT)
        self.play(Write(qr))
        fin = boxed(Tex(r"$\mathrm{Span}(\mathbf q_1, \dots, \mathbf q_k) = \mathrm{Span}(\mathbf a_1, \dots, \mathbf a_k)$ at every step: $A = QR$ (Theorem 5.6.2)", font_size=30, color=C3)).to_edge(DOWN, buff=0.25)
        self.play(FadeIn(fin))
        self.wait(2)


# =================================================================
# 5.7  Orthogonal polynomials (Legendre)
# =================================================================
class LegendrePolynomials(Scene):
    def construct(self):
        t = title(r"Orthogonal polynomials: Legendre, $\langle p, q\rangle = \int_{-1}^{1} p(x)q(x)\,dx$")
        ax = Axes(x_range=[-1, 1, 0.5], y_range=[-1.2, 1.2, 0.5], x_length=5.4, y_length=4.4, axis_config={"color": MUTE}).shift(LEFT * 3.6 + DOWN * 0.5)
        self.add(ax, t)
        P = [lambda x: 1 + 0 * x, lambda x: x, lambda x: (3 * x ** 2 - 1) / 2, lambda x: (5 * x ** 3 - 3 * x) / 2, lambda x: (35 * x ** 4 - 30 * x ** 2 + 3) / 8]
        cols = [INK, C1, C2, C3, AMB]
        tex = [r"P_0 = 1", r"P_1 = x", r"P_2 = \tfrac12(3x^2 - 1)", r"P_3 = \tfrac12(5x^3 - 3x)", r"P_4 = \tfrac18(35x^4 - 30x^2 + 3)"]
        labs = VGroup(*[MathTex(s, color=c, font_size=32) for s, c in zip(tex, cols)]).arrange(DOWN, aligned_edge=LEFT, buff=0.22)
        labs.shift((ax.get_right()[0] + 0.5 - labs.get_left()[0]) * RIGHT + (1.45 - labs.get_center()[1]) * UP)
        for f, c, lb in zip(P, cols, labs):
            self.play(Create(ax.plot(f, x_range=[-1, 1], color=c, stroke_width=4)), Write(lb), run_time=1.1)
        rec = MathTex(r"(n+1)P_{n+1} = (2n+1)\,x\,P_n - n\,P_{n-1}", font_size=30).next_to(labs, DOWN, buff=0.45).align_to(labs, LEFT)
        self.play(Write(rec))
        orth = MathTex(r"\langle P_i, P_j\rangle = 0 \ (i \ne j),\quad \|P_n\|^2 = \tfrac{2}{2n+1}", font_size=30, color=C3).next_to(rec, DOWN, buff=0.35).align_to(labs, LEFT)
        self.play(Write(orth))
        fin = boxed(Tex(r"Gram--Schmidt applied to $1, x, x^2, \dots$ gives these, up to scaling (Theorem 5.7.1: a three-term recursion)", font_size=28, color=C3)).to_edge(DOWN, buff=0.25)
        self.play(FadeIn(fin))
        self.wait(2)
