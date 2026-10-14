"""
Manim scenes for Chapter 4 (Linear Transformations) of
S. J. Leon, Linear Algebra with Applications (8th ed.).

Render:  manim -qm extras/manim/chapter4_definitions.py StandardMatrix
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from la_style import *  # noqa: E402,F401,F403


def arrow(p, a, b, color, w=6):
    return Arrow(p.c2p(*a), p.c2p(*b), buff=0, color=color, stroke_width=w, max_tip_length_to_length_ratio=0.18)


def lab_at(tex, point, direction, color, size=34):
    return MathTex(tex, color=color, font_size=size).next_to(point, direction, buff=0.08)


def clip_seg(p0, d, box):
    """Clip the line p0 + t d to the box (xmin, xmax, ymin, ymax); returns two points or None."""
    t0, t1 = -1e9, 1e9
    for k, (lo, hi) in enumerate(((box[0], box[1]), (box[2], box[3]))):
        if abs(d[k]) < 1e-12:
            if not lo <= p0[k] <= hi:
                return None
            continue
        a, b = (lo - p0[k]) / d[k], (hi - p0[k]) / d[k]
        t0, t1 = max(t0, min(a, b)), min(t1, max(a, b))
    if t0 >= t1:
        return None
    return p0 + t0 * d, p0 + t1 * d


def top_layer(scene, *mobs):
    """Keep titles and caption boxes above anything a transformation drew later."""
    scene.bring_to_front(*mobs)


# =================================================================
# 4.1  Linear transformation: grid lines stay straight, 0 stays put
# =================================================================
class LinearMap(Scene):
    def construct(self):
        t = title(r"Linear: $L(\alpha\mathbf x + \beta\mathbf y) = \alpha L(\mathbf x) + \beta L(\mathbf y)$")
        tb = BackgroundRectangle(t, fill_color=BG, fill_opacity=0.95, buff=0.12)
        p = plane((-7, 7), (-4, 4)).scale(0.8).shift(DOWN * 0.35)
        self.add(p, tb, t)
        o = p.c2p(0, 0)
        x, y = np.array([2.0, 0.5]), np.array([0.5, 1.5])
        ax, ay = arrow(p, (0, 0), x, C1), arrow(p, (0, 0), y, C2)
        axy = arrow(p, (0, 0), x + y, AMB)
        guide = VGroup(DashedLine(p.c2p(*x), p.c2p(*(x + y)), color=C2, stroke_width=2),
                       DashedLine(p.c2p(*y), p.c2p(*(x + y)), color=C1, stroke_width=2))
        lx, ly = lab_at(r"\mathbf x", ax.get_end(), DR, C1), lab_at(r"\mathbf y", ay.get_end(), LEFT, C2)
        lxy = lab_at(r"\mathbf x+\mathbf y", axy.get_end(), UR, AMB, 30)
        self.play(GrowArrow(ax), GrowArrow(ay), FadeIn(lx, ly))
        self.play(Create(guide), GrowArrow(axy), FadeIn(lxy))
        A = np.array([[1.0, 0.8], [0.3, 1.1]])
        cap = boxed(Tex(r"Apply $L(\mathbf x) = A\mathbf x$, \ $A = \begin{pmatrix}1 & 0.8\\ 0.3 & 1.1\end{pmatrix}$", font_size=32)).to_corner(UL).shift(DOWN * 0.95)
        self.play(FadeIn(cap))
        grp = VGroup(p, ax, ay, axy, guide)
        self.play(FadeOut(lx, ly, lxy))
        self.play(ApplyMatrix(A, grp, about_point=o), run_time=2.5)
        Lx, Ly = A @ x, A @ y
        new_l = VGroup(lab_at(r"L(\mathbf x)", p.c2p(*Lx), DR, C1, 30), lab_at(r"L(\mathbf y)", p.c2p(*Ly), LEFT, C2, 30),
                       lab_at(r"L(\mathbf x+\mathbf y) = L(\mathbf x)+L(\mathbf y)", p.c2p(*(Lx + Ly)), RIGHT, AMB, 28))
        self.play(FadeIn(new_l))
        ok = boxed(Tex(r"Grid lines stay straight, parallel and evenly spaced; $\mathbf 0$ stays at $\mathbf 0$.", font_size=30, color=C3)).to_edge(DOWN, buff=0.3)
        top_layer(self, tb, t, cap)
        self.play(FadeIn(ok))
        self.wait(1.2)
        # ---- a translation is not linear
        self.play(FadeOut(VGroup(grp, new_l, ok, cap)))
        p2 = plane((-7, 7), (-4, 4)).scale(0.8).shift(DOWN * 0.35)
        o2 = Dot(p2.c2p(0, 0), color=WARN, radius=0.09)
        self.play(FadeIn(p2), FadeIn(o2))
        top_layer(self, tb, t)
        cap2 = boxed(Tex(r"Translation $L(\mathbf x) = \mathbf x + \mathbf a$, \ $\mathbf a = (2, 1)^T$", font_size=32, color=WARN)).to_corner(UL).shift(DOWN * 0.95)
        self.play(FadeIn(cap2))
        self.play(VGroup(p2, o2).animate.shift(p2.c2p(2, 1) - p2.c2p(0, 0)), run_time=2)
        bad = boxed(Tex(r"$L(\mathbf 0) = \mathbf a \ne \mathbf 0$: a translation is not linear (Exercise 4.1.3)", font_size=30, color=WARN)).to_edge(DOWN, buff=0.3)
        self.play(FadeIn(bad))
        self.wait(1)
        # ---- a curved map is not linear either
        self.play(FadeOut(VGroup(p2, o2, cap2, bad)))
        p3 = plane((-7, 7), (-4, 4)).scale(0.8).shift(DOWN * 0.35)
        p3.prepare_for_nonlinear_transform()
        self.play(FadeIn(p3))
        top_layer(self, tb, t)
        cap3 = boxed(Tex(r"$M(\mathbf x) = (x_1,\ x_2 + 0.08\,x_1^2)^T$", font_size=32, color=WARN)).to_corner(UL).shift(DOWN * 0.95)
        self.play(FadeIn(cap3))
        o3 = p3.c2p(0, 0)
        s = 0.8

        def bend(pt):
            u = (pt[0] - o3[0]) / s
            return pt + np.array([0, 0.08 * u * u * s, 0])

        self.play(ApplyPointwiseFunction(bend, p3), run_time=2.5)
        top_layer(self, tb, t, cap3)
        bad3 = boxed(Tex(r"Grid lines bend: $M(2\mathbf x) \ne 2M(\mathbf x)$, so $M$ is not linear", font_size=30, color=WARN)).to_edge(DOWN, buff=0.3)
        self.play(FadeIn(bad3))
        self.wait(2)


# =================================================================
# 4.2  Standard matrix: the columns are L(e1), L(e2)
# =================================================================
class StandardMatrix(Scene):
    def construct(self):
        t = title(r"The standard matrix: column $j$ is $L(\mathbf e_j)$")
        self.add(t)
        p = plane((-3, 3), (-3, 3)).scale(0.95).shift(LEFT * 3.4 + DOWN * 0.45)
        self.play(FadeIn(p))
        o = p.c2p(0, 0)
        e1, e2 = arrow(p, (0, 0), (1, 0), C1), arrow(p, (0, 0), (0, 1), C2)
        l1, l2 = lab_at(r"\mathbf e_1", e1.get_end(), DOWN, C1), lab_at(r"\mathbf e_2", e2.get_end(), LEFT, C2)
        self.play(GrowArrow(e1), GrowArrow(e2), FadeIn(l1, l2))
        cap = Tex(r"$L$ = rotation by $\theta = 60^\circ$ counterclockwise", font_size=32).to_edge(RIGHT, buff=0.6).shift(UP * 2.3)
        self.play(Write(cap))
        th = PI / 3
        arc = Arc(radius=0.6, start_angle=0, angle=th, arc_center=o, color=AMB)
        self.play(Rotate(VGroup(e1), th, about_point=o), Rotate(VGroup(e2), th, about_point=o), Create(arc), FadeOut(l1, l2), run_time=2.2)
        t1, t2 = lab_at(r"L(\mathbf e_1)", e1.get_end(), RIGHT, C1, 30), lab_at(r"L(\mathbf e_2)", e2.get_end(), LEFT, C2, 30)
        L1 = MathTex(r"L(\mathbf e_1) = (\cos\theta,\ \sin\theta)^T", color=C1, font_size=32)
        L2 = MathTex(r"L(\mathbf e_2) = (-\sin\theta,\ \cos\theta)^T", color=C2, font_size=32)
        VGroup(L1, L2).arrange(DOWN, aligned_edge=LEFT, buff=0.2).next_to(cap, DOWN, buff=0.35).align_to(cap, LEFT)
        self.play(FadeIn(t1, t2), TransformFromCopy(t1, L1), TransformFromCopy(t2, L2))
        A = mat([[r"\cos\theta", r"-\sin\theta"], [r"\sin\theta", r"\cos\theta"]], h=1.8, scale=0.85)
        A.get_columns()[0].set_color(C1); A.get_columns()[1].set_color(C2)
        Arow = VGroup(MathTex("A =", font_size=40), A).arrange(RIGHT).next_to(L2, DOWN, buff=0.35).align_to(cap, LEFT)
        self.play(TransformFromCopy(L1, A.get_columns()[0]), TransformFromCopy(L2, A.get_columns()[1]), FadeIn(Arow[0], A.get_brackets()))
        self.wait(1)
        why = VGroup(
            MathTex(r"\mathbf x = x_1\mathbf e_1 + x_2\mathbf e_2", font_size=34),
            MathTex(r"L(\mathbf x) = x_1 L(\mathbf e_1) + x_2 L(\mathbf e_2) = A\mathbf x", font_size=34),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.25).next_to(Arow, DOWN, buff=0.35).align_to(cap, LEFT)
        self.play(Write(why[0]))
        self.play(Write(why[1]))
        # illustrate with x = (2, 1)
        xv = np.array([2.0, 1.0])
        R = np.array([[np.cos(th), -np.sin(th)], [np.sin(th), np.cos(th)]])
        ghost = arrow(p, (0, 0), xv, MUTE, 4)
        self.play(GrowArrow(ghost))
        s1 = arrow(p, (0, 0), 2 * R[:, 0], C1, 5)
        s2 = arrow(p, 2 * R[:, 0], R @ xv, C2, 5)
        res = arrow(p, (0, 0), R @ xv, AMB, 6)
        self.play(GrowArrow(s1))
        self.play(GrowArrow(s2))
        self.play(GrowArrow(res), FadeIn(lab_at(r"A\mathbf x", res.get_end(), UL, AMB, 32)))
        fin = boxed(Tex(r"Theorem 4.2.1: every linear $L:\mathbb R^n\to\mathbb R^m$ is $L(\mathbf x) = A\mathbf x$ with $\mathbf a_j = L(\mathbf e_j)$", font_size=30, color=C3)).to_edge(DOWN, buff=0.25)
        self.play(FadeIn(fin))
        self.wait(2)


# =================================================================
# 4.1  Kernel and range
# =================================================================
class KernelRange(Scene):
    def construct(self):
        t = title(r"Kernel and range: what goes to $\mathbf 0$, and where everything lands")
        tb = BackgroundRectangle(t, fill_color=BG, fill_opacity=0.95, buff=0.12)
        p = plane((-7, 7), (-4, 4)).scale(0.8).shift(DOWN * 0.35)
        self.add(p, tb, t)
        o = p.c2p(0, 0)
        ref = p.copy()
        A = np.array([[1.0, 2.0], [0.5, 1.0]])
        cap = boxed(MathTex(r"L(\mathbf x) = A\mathbf x,\quad A = \begin{pmatrix}1 & 2\\ 0.5 & 1\end{pmatrix}", font_size=34)).to_corner(UL).shift(DOWN * 0.95)
        self.play(FadeIn(cap))
        kline = Line(p.c2p(-6, 3), p.c2p(6, -3), color=WARN, stroke_width=5)
        kdots = VGroup(*[Dot(p.c2p(2 * s, -s), color=WARN, radius=0.07) for s in (-2, -1, 1, 2)])
        klab = boxed(MathTex(r"\ker(L) = \mathrm{Span}\{(2,-1)^T\}", color=WARN, font_size=32)).next_to(p.c2p(-5, 2.5), DOWN, buff=0.1)
        self.play(Create(kline), FadeIn(kdots), FadeIn(klab))
        others = VGroup(*[Dot(p.c2p(a, b), color=C1, radius=0.07) for a, b in [(1, 1), (-1, 2), (2, 2), (0, -2), (-2, -1), (3, 0)]])
        self.play(FadeIn(others))
        self.wait(0.8)
        top_layer(self, tb, t, cap)
        self.play(ApplyMatrix(A, VGroup(p, kline, kdots, others), about_point=o), FadeOut(klab), run_time=3)
        top_layer(self, tb, t, cap)
        rng = Line(ref.c2p(-6, -3), ref.c2p(6, 3), color=C3, stroke_width=5)
        self.play(Create(rng))
        rl = boxed(VGroup(
            MathTex(r"\text{every red point} \mapsto \mathbf 0", color=WARN, font_size=32),
            MathTex(r"L(\mathbb R^2) = \mathrm{Span}\{(2,1)^T\}", color=C3, font_size=32),
        ).arrange(DOWN, aligned_edge=LEFT)).to_corner(UR).shift(DOWN * 0.95)
        self.play(FadeIn(rl))
        fin = boxed(Tex(r"$\dim\ker(L) + \dim L(\mathbb R^2) = 1 + 1 = 2$, the rank--nullity theorem for $A$", font_size=30, color=C3)).to_edge(DOWN, buff=0.3)
        self.play(FadeIn(fin))
        self.wait(2)


# =================================================================
# 4.2  Matrix representation with respect to a basis (Example 4)
# =================================================================
class BasisRepresentation(Scene):
    def construct(self):
        t = title(r"Matrix of $L$ in a basis: column $j$ is $[L(\mathbf b_j)]_F$")
        tb = BackgroundRectangle(t, fill_color=BG, fill_opacity=0.95, buff=0.12)
        p = plane((-4, 4), (-1.5, 4.5)).scale(0.95).shift(LEFT * 3.0 + DOWN * 0.9)
        self.add(p, tb, t)
        b1, b2 = np.array([1.0, 1.0]), np.array([-1.0, 1.0])
        grid = VGroup()
        for k in range(-8, 9):
            for d, e in ((b1, b2), (b2, b1)):
                seg = clip_seg(k * d, e, (-4, 4, -1.5, 4.5))
                if seg:
                    grid.add(Line(p.c2p(*seg[0]), p.c2p(*seg[1]), color=C2 if d is b1 else C1, stroke_opacity=0.35, stroke_width=1.5))
        A1, A2 = arrow(p, (0, 0), b1, C1), arrow(p, (0, 0), b2, C2)
        self.play(Create(grid), run_time=1.5)
        top_layer(self, tb, t)
        self.play(GrowArrow(A1), GrowArrow(A2), FadeIn(lab_at(r"\mathbf b_1", A1.get_end(), RIGHT, C1), lab_at(r"\mathbf b_2", A2.get_end(), LEFT, C2)))
        rule = MathTex(r"L(\alpha\mathbf b_1 + \beta\mathbf b_2) = (\alpha+\beta)\mathbf b_1 + 2\beta\,\mathbf b_2", font_size=32).to_edge(RIGHT, buff=0.4).shift(UP * 2.4)
        self.play(Write(rule))
        Lb1 = arrow(p, (0, 0), b1, C1, 9)
        Lb2 = arrow(p, (0, 0), b1 + 2 * b2, AMB, 6)
        steps = VGroup(arrow(p, (0, 0), b1, C1, 4), arrow(p, b1, b1 + b2, C2, 4), arrow(p, b1 + b2, b1 + 2 * b2, C2, 4))
        e1 = MathTex(r"L(\mathbf b_1) = 1\,\mathbf b_1 + 0\,\mathbf b_2", font_size=34, color=C1)
        e2 = MathTex(r"L(\mathbf b_2) = 1\,\mathbf b_1 + 2\,\mathbf b_2", font_size=34, color=AMB)
        VGroup(e1, e2).arrange(DOWN, aligned_edge=LEFT).next_to(rule, DOWN, buff=0.5).align_to(rule, LEFT)
        self.play(Indicate(A1), Write(e1), FadeIn(Lb1))
        self.play(Create(steps), run_time=2)
        self.play(GrowArrow(Lb2), Write(e2))
        Am = mat([[1, 1], [0, 2]], scale=0.9)
        Am.get_columns()[0].set_color(C1); Am.get_columns()[1].set_color(AMB)
        Arow = VGroup(MathTex(r"A =", font_size=40), Am).arrange(RIGHT).next_to(e2, DOWN, buff=0.5).align_to(rule, LEFT)
        self.play(FadeIn(Arow[0], Am.get_brackets()), TransformFromCopy(e1, Am.get_columns()[0]), TransformFromCopy(e2, Am.get_columns()[1]))
        rep = MathTex(r"[L(\mathbf v)]_F = A\,[\mathbf v]_E", font_size=40, color=C3).next_to(Arow, DOWN, buff=0.5).align_to(rule, LEFT)
        self.play(Write(rep))
        fin = boxed(Tex(r"Leon \S4.2 Example 4. In $\mathbb R^m$: $\mathbf a_j = B^{-1}L(\mathbf u_j)$, i.e.\ rref$(B \mid L(\mathbf u_1)\cdots L(\mathbf u_n)) = (I \mid A)$", font_size=28, color=C3)).to_edge(DOWN, buff=0.25)
        self.play(FadeIn(fin))
        self.wait(2)


# =================================================================
# 4.2 Application 1: homogeneous coordinates make translation linear
# =================================================================
class Homogeneous(Scene):
    def construct(self):
        t = title(r"Computer graphics: homogeneous coordinates make translation a matrix")
        tb = BackgroundRectangle(t, fill_color=BG, fill_opacity=0.95, buff=0.12)
        p = plane((-2, 5), (-2, 4)).scale(0.9).shift(LEFT * 3.4 + DOWN * 0.6)
        self.add(p, tb, t)
        T = np.array([[0, 1, 1, 0], [0, 1, -1, 0]], dtype=float)

        def tri(M, color):
            return Polygon(*[p.c2p(*M[:, k]) for k in range(3)], color=color, fill_opacity=0.35, stroke_width=4)

        shape = tri(T, C1)
        X0 = p.get_right()[0] + 0.45

        def at_left(m):
            return m.shift((X0 - m.get_left()[0]) * RIGHT)

        Tm = mat([[0, 1, 1, 0], [0, 1, -1, 0]], scale=0.75)
        Trow = at_left(VGroup(MathTex("T =", font_size=36), Tm).arrange(RIGHT).shift(UP * 2.5))
        self.play(DrawBorderThenFill(shape), FadeIn(Trow))
        c1 = at_left(Tex(r"vertices as columns; the last repeats $(0,0)$\\to close the figure", font_size=26, color=MUTE).next_to(Trow, DOWN, buff=0.2))
        self.play(FadeIn(c1))
        self.wait(0.6)
        # dilation by 1.5
        D = 1.5 * np.eye(2)
        s2 = tri(D @ T, C2)
        d_eq = MathTex(r"1.5\,I\,T", font_size=34, color=C2).next_to(c1, DOWN, buff=0.3).align_to(Trow, LEFT)
        self.play(Transform(shape, s2), Write(d_eq), run_time=1.6)
        # rotation by 60 degrees
        th = PI / 3
        R = np.array([[np.cos(th), -np.sin(th)], [np.sin(th), np.cos(th)]])
        s3 = tri(R @ D @ T, C3)
        r_eq = MathTex(r"R_{60^\circ}(1.5\,I)\,T", font_size=34, color=C3).next_to(d_eq, RIGHT, buff=0.8)
        self.play(Transform(shape, s3), Write(r_eq), run_time=1.6)
        self.wait(0.6)
        # translation needs a 3x3 matrix
        warn = at_left(Tex(r"Translation $\mathbf x + \mathbf a$ is not linear:\\no $2\times2$ matrix does it.", font_size=28, color=WARN).next_to(d_eq, DOWN, buff=0.3))
        self.play(FadeIn(warn))
        H = mat([[1, 0, "a_1"], [0, 1, "a_2"], [0, 0, 1]], scale=0.75)
        H.get_columns()[2].set_color(AMB)
        hx = mat([["x_1"], ["x_2"], [1]], scale=0.75)
        res = mat([["x_1 + a_1"], ["x_2 + a_2"], [1]], scale=0.75)
        hrow = at_left(VGroup(H, hx, MathTex("=", font_size=36), res).arrange(RIGHT, buff=0.2).scale(0.85).next_to(warn, DOWN, buff=0.25))
        self.play(FadeIn(hrow))
        a = np.array([2.0, 1.0])
        s4 = tri((R @ D @ T) + a[:, None], AMB)
        self.play(Transform(shape, s4), run_time=2)
        fin = boxed(Tex(r"Each $(x_1, x_2)$ becomes $(x_1, x_2, 1)$; every operation is a $3\times3$ matrix, and a sequence is one product", font_size=28, color=C3)).to_edge(DOWN, buff=0.25)
        self.play(FadeIn(fin))
        self.wait(2)


# =================================================================
# 4.3  Similarity: one operator, two matrices, B = S^{-1} A S
# =================================================================
class Similarity(Scene):
    def construct(self):
        t = title(r"Similar matrices: the same operator seen in two bases")
        self.add(t)
        Lx = MathTex(r"L(\mathbf x) = (2x_1,\ x_1 + x_2)^T", font_size=38).shift(UP * 2.55)
        self.play(Write(Lx))
        A = mat([[2, 0], [1, 1]], scale=0.8)
        U = mat([[1, -1], [1, 1]], scale=0.8)
        B = mat([[2, -1], [0, 1]], scale=0.8)
        left = VGroup(Tex(r"in $[\mathbf e_1, \mathbf e_2]$:", font_size=30), MathTex("A =", font_size=36), A).arrange(RIGHT).move_to(LEFT * 3.4 + UP * 1.05)
        right = VGroup(Tex(r"in $[\mathbf u_1, \mathbf u_2]$:", font_size=30), MathTex("B =", font_size=36), B).arrange(RIGHT).move_to(RIGHT * 3.4 + UP * 1.05)
        self.play(FadeIn(left))
        ub = MathTex(r"\mathbf u_1 = (1,1)^T,\quad \mathbf u_2 = (-1,1)^T", font_size=32, color=C2).shift(UP * 1.95)
        self.play(FadeIn(ub))
        # commutative square on the left
        cx = -2.7
        y = MathTex(r"\mathbf y", font_size=40).move_to([cx - 1.5, -0.35, 0])
        tt = MathTex(r"\mathbf t", font_size=40).move_to([cx + 1.5, -0.35, 0])
        x = MathTex(r"\mathbf x", font_size=40).move_to([cx - 1.5, -2.15, 0])
        z = MathTex(r"\mathbf z", font_size=40).move_to([cx + 1.5, -2.15, 0])
        top = Arrow(y.get_right(), tt.get_left(), color=C1, buff=0.15)
        bot = Arrow(x.get_right(), z.get_left(), color=C2, buff=0.15)
        upl = Arrow(x.get_top(), y.get_bottom(), color=AMB, buff=0.15)
        dnr = Arrow(tt.get_bottom(), z.get_top(), color=AMB, buff=0.15)
        labs = VGroup(MathTex("A", color=C1, font_size=34).next_to(top, UP, buff=0.08),
                      MathTex("B", color=C2, font_size=34).next_to(bot, DOWN, buff=0.08),
                      MathTex("U", color=AMB, font_size=34).next_to(upl, LEFT, buff=0.08),
                      MathTex("U^{-1}", color=AMB, font_size=34).next_to(dnr, RIGHT, buff=0.08))
        names = VGroup(Tex(r"standard", font_size=24, color=MUTE).next_to(y, LEFT, buff=0.5), Tex(r"$\mathbf u$-coords", font_size=24, color=MUTE).next_to(x, LEFT, buff=0.5))
        self.play(FadeIn(x, names[1]))
        self.play(GrowArrow(upl), FadeIn(y, labs[2], names[0]))
        self.play(GrowArrow(top), FadeIn(tt, labs[0]))
        self.play(GrowArrow(dnr), FadeIn(z, labs[3]))
        self.play(GrowArrow(bot), FadeIn(labs[1]))
        eq = MathTex(r"B = U^{-1}AU", font_size=40, color=C3).move_to([cx, -1.25, 0])
        self.play(Write(eq))
        Ui = mat([[r"\tfrac12", r"\tfrac12"], [r"-\tfrac12", r"\tfrac12"]], scale=0.8)
        calc = VGroup(Ui, A.copy(), U, MathTex("=", font_size=36), B.copy()).arrange(RIGHT, buff=0.15).scale(0.85).move_to([3.5, -1.25, 0])
        self.play(FadeIn(calc[:4]))
        self.play(FadeIn(calc[4]))
        self.play(FadeIn(right))
        inv = boxed(Tex(r"Similar matrices share determinant ($2$), trace ($3$), rank and characteristic polynomial", font_size=26, color=C3)).to_edge(DOWN, buff=0.25)
        self.play(FadeIn(inv))
        self.wait(2)
