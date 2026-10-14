"""
Manim scenes for Chapter 7 (Numerical Linear Algebra) of
S. J. Leon, Linear Algebra with Applications (8th ed.).

Render:  manim -qm extras/manim/chapter7_definitions.py PartialPivoting
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
# 7.1  Floating-point numbers are not evenly spaced
# =================================================================
class FloatingPointLine(Scene):
    def construct(self):
        t = title(r"Floating-point numbers: $\pm(0.d_1d_2\cdots d_t)_b \times b^e$, \ $L \le e \le U$")
        self.add(t)
        sys_ = MathTex(r"b = 10,\ t = 1,\ L = -1,\ U = 1:\ \ 55 \text{ numbers (Example 7.1.3)}", font_size=34).shift(UP * 2.4)
        self.play(Write(sys_))
        nl = NumberLine(x_range=[0, 2, 0.5], length=12, include_numbers=True, font_size=26, color=MUTE).shift(UP * 0.7)
        self.play(Create(nl))
        ticks = VGroup()
        vals = [d * 10.0 ** (e - 1) for e in (-1, 0, 1) for d in range(1, 10)]
        for v in sorted(vals):
            if v <= 2:
                ticks.add(Line(nl.n2p(v) + DOWN * 0.22, nl.n2p(v) + UP * 0.22, color=AMB if v < 0.1 else (C1 if v < 1 else C2), stroke_width=4))
        ticks.add(Line(nl.n2p(0) + DOWN * 0.22, nl.n2p(0) + UP * 0.22, color=INK, stroke_width=4))
        self.play(LaggedStart(*[Create(m) for m in ticks], lag_ratio=0.08), run_time=3)
        c1 = Tex(r"nine numbers crowd into $[0.01, 0.09]$, nine into $[0.1, 0.9]$, then gaps of $1$", font_size=30, color=MUTE).next_to(nl, DOWN, buff=0.7)
        self.play(FadeIn(c1))
        self.wait(1)
        x = 1.37
        dot = Dot(nl.n2p(x), color=WARN, radius=0.09)
        lx = MathTex(r"x = 1.37", font_size=30, color=WARN).next_to(dot, UP, buff=0.8)
        self.play(FadeIn(dot), FadeIn(lx))
        fx = Dot(nl.n2p(1.0), color=C2, radius=0.11)
        arr = CurvedArrow(nl.n2p(x) + UP * 0.25, nl.n2p(1.0) + UP * 0.25, color=WARN, angle=PI / 3)
        lf = MathTex(r"fl(x) = 0.1\times10^1 = 1", font_size=30, color=C2).next_to(nl.n2p(1.0), UP, buff=0.8).shift(LEFT * 1.6)
        self.play(Create(arr), FadeIn(fx), FadeIn(lf))
        err = VGroup(MathTex(r"\text{relative error } \delta = \frac{fl(x) - x}{x} \approx -0.27", font_size=32),
                     MathTex(r"|\delta| \le \epsilon = \tfrac12 b^{1-t}; \quad \text{IEEE double (Leon): } \epsilon = 2^{-52} \approx 2.2\times10^{-16}", font_size=30, color=C3)
                     ).arrange(DOWN, buff=0.3).next_to(c1, DOWN, buff=0.5)
        self.play(Write(err[0]))
        self.play(Write(err[1]))
        fin = boxed(Tex(r"Relative spacing is roughly constant; absolute spacing grows with the exponent", font_size=30, color=C3)).to_edge(DOWN, buff=0.25)
        self.play(FadeIn(fin))
        self.wait(2)


# =================================================================
# 7.3  Partial pivoting: Example 7.3.3 in 3-digit arithmetic
# =================================================================
class PartialPivoting(Scene):
    def construct(self):
        t = title(r"Pivoting: a tiny pivot ruins 3-digit elimination (Example 7.3.3)")
        self.add(t)
        sysm = MathTex(r"\begin{aligned}0.0001x_1 + 2x_2 &= 4\\ x_1 + x_2 &= 3\end{aligned}\qquad \mathbf x \approx (1.0001,\ 1.9999)^T", font_size=34).shift(UP * 2.55)
        self.play(Write(sysm))
        left = Tex(r"no interchange", font_size=32, color=WARN).move_to(LEFT * 3.5 + UP * 1.6)
        right = Tex(r"partial pivoting", font_size=32, color=C3).move_to(RIGHT * 3.5 + UP * 1.6)
        self.play(FadeIn(left), FadeIn(right))
        L1 = mat([["0.0001", "2", "4"], ["1", "1", "3"]], h=1.4, scale=0.7).next_to(left, DOWN, buff=0.25)
        R1 = mat([["1", "1", "3"], ["0.0001", "2", "4"]], h=1.4, scale=0.7).next_to(right, DOWN, buff=0.25)
        self.play(FadeIn(L1), FadeIn(R1))
        m1 = MathTex(r"m_{21} = 10^4", font_size=30, color=WARN).next_to(L1, DOWN, buff=0.2)
        m2 = MathTex(r"m_{21} = 0.0001", font_size=30, color=C3).next_to(R1, DOWN, buff=0.2)
        self.play(Write(m1), Write(m2))
        L2 = mat([["0.0001", "2", "4"], ["0", r"-0.200\cdot10^5", r"-0.400\cdot10^5"]], h=3.2, scale=0.6).move_to(L1)
        R2 = mat([["1", "1", "3"], ["0", "2.00", "4.00"]], h=1.4, scale=0.7).move_to(R1)
        self.play(Transform(L1, L2), Transform(R1, R2))
        n1 = Tex(r"$1 - 2\cdot10^4$ rounds to $-0.200\cdot10^5$: the $1$ is lost", font_size=26, color=MUTE).next_to(m1, DOWN, buff=0.25)
        self.play(FadeIn(n1))
        s1 = MathTex(r"x_2 = 2,\ \ x_1 = \frac{4 - 2\cdot2}{0.0001} = 0", font_size=32, color=WARN).next_to(n1, DOWN, buff=0.35)
        s2 = MathTex(r"x_2 = 2,\ \ x_1 = 3 - 2 = 1", font_size=32, color=C3).move_to([3.5, s1.get_center()[1], 0])
        self.play(Write(s1), Write(s2))
        self.play(Create(SurroundingRectangle(s1, color=WARN, buff=0.12)), Create(SurroundingRectangle(s2, color=C3, buff=0.12)))
        fin = boxed(Tex(r"Partial pivoting: the largest $|a_{ki}|$ is the pivot, so every $|m_{ki}| \le 1$", font_size=30, color=C3)).to_edge(DOWN, buff=0.25)
        self.play(FadeIn(fin))
        self.wait(2)


# =================================================================
# 7.4  Condition number: nearly parallel lines
# =================================================================
class ConditionNumber(Scene):
    def construct(self):
        t = title(r"Condition number: $\mathrm{cond}(A) = \|A\|\,\|A^{-1}\|$ amplifies relative errors")
        tb = BackgroundRectangle(t, fill_color=BG, fill_opacity=0.95, buff=0.12)
        p = plane((-1, 5), (-1, 5)).scale(0.95).shift(LEFT * 3.4 + DOWN * 0.6)
        self.add(p, tb, t)
        # 2x1 + 2x2 = 6, 2x1 + 2.0005 x2 = 6.001 -> (1, 2); perturb second rhs to 6.002 -> (0, 3)
        eps = ValueTracker(0.0)
        l1 = Line(p.c2p(-1, 4), p.c2p(4, -1), color=C1, stroke_width=4)  # x1 + x2 = 3
        def line2():
            c = 6.001 + eps.get_value()
            # 2 x1 + 2.0005 x2 = c ; draw with exaggerated tilt for visibility: use slope as is
            pts = [(-1, (c + 2) / 2.0005), (4, (c - 8) / 2.0005)]
            return Line(p.c2p(*pts[0]), p.c2p(*pts[1]), color=C2, stroke_width=4)
        l2 = always_redraw(line2)
        def sol():
            c = 6.001 + eps.get_value()
            x2 = (c - 6) / 0.0005
            return np.array([3 - x2, x2])
        dot = always_redraw(lambda: Dot(p.c2p(*sol()), color=AMB, radius=0.1))
        eqs = VGroup(MathTex(r"2x_1 + 2x_2 = 6", font_size=32, color=C1),
                     MathTex(r"2x_1 + 2.0005x_2 = 6.001 + \delta", font_size=32, color=C2)).arrange(DOWN, aligned_edge=LEFT)
        eqs.shift((p.get_right()[0] + 0.4 - eqs.get_left()[0]) * RIGHT + (2.2 - eqs.get_center()[1]) * UP)
        self.play(Create(l1), Create(l2), FadeIn(eqs))
        self.play(FadeIn(dot))
        sl = always_redraw(lambda: MathTex(r"\delta = %.4f:\ \ \mathbf x = (%.2f,\ %.2f)" % (eps.get_value(), *sol()), font_size=32, color=AMB).next_to(eqs, DOWN, buff=0.4).align_to(eqs, LEFT))
        self.play(FadeIn(sl))
        self.play(eps.animate.set_value(0.001), run_time=3)
        self.play(eps.animate.set_value(-0.001), run_time=3)
        self.play(eps.animate.set_value(0.0), run_time=2)
        info = VGroup(MathTex(r"\frac{|\delta|}{\|\mathbf b\|} \approx 1.7\times10^{-4}\ \Rightarrow\ \frac{\|\Delta\mathbf x\|_\infty}{\|\mathbf x\|_\infty} = 1", font_size=30),
                      MathTex(r"\mathrm{cond}_\infty(A) = \|A\|_\infty\|A^{-1}\|_\infty \approx 1.6\times10^4", font_size=30, color=C3),
                      MathTex(r"\frac{\|\Delta\mathbf x\|}{\|\mathbf x\|} \le \mathrm{cond}(A)\,\frac{\|\Delta\mathbf b\|}{\|\mathbf b\|}", font_size=32)).arrange(DOWN, aligned_edge=LEFT, buff=0.3).next_to(sl, DOWN, buff=0.45).align_to(eqs, LEFT)
        self.play(Write(info[0]))
        self.play(Write(info[1]))
        self.play(Write(info[2]))
        fin = boxed(Tex(r"Nearly parallel lines: a tiny change in the data moves the intersection far (Example 7.4.2)", font_size=30, color=C3)).to_edge(DOWN, buff=0.25)
        self.play(FadeIn(fin))
        self.wait(2)


# =================================================================
# 7.5  Householder reflection
# =================================================================
class Householder(Scene):
    def construct(self):
        t = title(r"Householder: $H = I - \frac{1}{\beta}\mathbf v\mathbf v^T$ reflects $\mathbf x$ onto $\|\mathbf x\|\mathbf e_1$")
        tb = BackgroundRectangle(t, fill_color=BG, fill_opacity=0.95, buff=0.12)
        p = plane((-2, 6), (-2, 5)).scale(0.9).shift(LEFT * 3.2 + DOWN * 0.6)
        self.add(p, tb, t)
        x = np.array([3.0, 4.0])
        a = np.linalg.norm(x)
        v = x - np.array([a, 0])
        X = arrow(p, (0, 0), x, C1, 6)
        self.play(GrowArrow(X), FadeIn(lab_at(r"\mathbf x = (3, 4)^T", X.get_end(), UR, C1, 30)))
        V = arrow(p, (a, 0), x, AMB, 5)
        self.play(GrowArrow(V), FadeIn(lab_at(r"\mathbf v = \mathbf x - 5\mathbf e_1", V.get_center(), RIGHT, AMB, 28)))
        n = np.array([v[1], -v[0]]) / np.linalg.norm(v)
        mirror = DashedLine(p.c2p(*(-1.8 * n)), p.c2p(*(5.5 * n)), color=C3, stroke_width=3)
        self.play(Create(mirror), FadeIn(lab_at(r"\text{mirror } \perp \mathbf v", p.c2p(*(-1.2 * n)), DOWN, C3, 28)))
        eqs = VGroup(MathTex(r"\alpha = \|\mathbf x\| = 5,\ \ \mathbf v = (-2, 4)^T", font_size=32),
                     MathTex(r"\beta = \alpha(\alpha - x_1) = 10", font_size=32),
                     MathTex(r"H = I - \tfrac1{10}\mathbf v\mathbf v^T = \begin{pmatrix}0.6 & 0.8\\ 0.8 & -0.6\end{pmatrix}", font_size=32)).arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        eqs.shift((p.get_right()[0] + 0.4 - eqs.get_left()[0]) * RIGHT + (1.6 - eqs.get_center()[1]) * UP)
        self.play(Write(eqs[0]))
        self.play(Write(eqs[1]))
        self.play(Write(eqs[2]))
        Hx = X.copy()
        self.play(Transform(Hx, arrow(p, (0, 0), (a, 0), C2, 6)), run_time=2)
        self.play(FadeIn(lab_at(r"H\mathbf x = (5, 0)^T", p.c2p(a, 0), DOWN, C2, 30)))
        props = MathTex(r"H^T = H = H^{-1}:\ \text{orthogonal,}\\ \text{so } \|H\mathbf x\| = \|\mathbf x\|", font_size=30, color=C3).next_to(eqs, DOWN, buff=0.4).align_to(eqs, LEFT)
        self.play(Write(props))
        fin = boxed(Tex(r"Applied column by column, Householder matrices give $A = QR$ without the instability of Gram--Schmidt", font_size=28, color=C3)).to_edge(DOWN, buff=0.25)
        self.play(FadeIn(fin))
        self.wait(2)


# =================================================================
# 7.6  Power method
# =================================================================
class PowerMethod(Scene):
    def construct(self):
        t = title(r"Power method: $\mathbf u_{k+1} = A\mathbf u_k / \text{scale}$ turns toward the dominant eigenvector")
        tb = BackgroundRectangle(t, fill_color=BG, fill_opacity=0.95, buff=0.12)
        p = plane((-1, 3), (-1, 3)).scale(1.3).shift(LEFT * 3.4 + DOWN * 0.7)
        self.add(p, tb, t)
        A = np.array([[2.0, 1.0], [1.0, 2.0]])
        line = DashedLine(p.c2p(-1, -1), p.c2p(3, 3), color=AMB, stroke_width=3)
        cap = VGroup(MathTex(r"A = \begin{pmatrix}2 & 1\\ 1 & 2\end{pmatrix},\ \lambda_1 = 3,\ \lambda_2 = 1", font_size=32),
                     MathTex(r"\mathbf x_1 = (1, 1)^T \text{ (dashed)}", font_size=30, color=AMB)).arrange(DOWN, aligned_edge=LEFT)
        cap.shift((p.get_right()[0] + 0.4 - cap.get_left()[0]) * RIGHT + (2.3 - cap.get_center()[1]) * UP)
        self.play(FadeIn(cap), Create(line))
        u = np.array([2.0, 0.0])
        cur = arrow(p, (0, 0), u, C1, 6)
        lbl_ = MathTex(r"\mathbf u_0 = (2, 0)^T", font_size=30, color=C1).next_to(cap, DOWN, buff=0.4).align_to(cap, LEFT)
        self.play(GrowArrow(cur), FadeIn(lbl_))
        rows = VGroup()
        for k in range(1, 7):
            v = A @ u
            m = np.max(np.abs(v))
            u = v / m
            new = arrow(p, (0, 0), u * 2 / np.linalg.norm(u) * 1.0, C1, 6)
            txt = MathTex(r"k = %d:\ \mathbf u_k = (%.4f,\ %.4f)^T,\ \ \text{scale} = %.4f" % (k, u[0], u[1], m), font_size=24)
            rows.add(txt)
            txt.next_to(lbl_ if k == 1 else rows[k - 2], DOWN, buff=0.15).align_to(cap, LEFT)
            ghost = cur.copy().set_opacity(0.25)
            self.add(ghost)
            self.play(Transform(cur, new), FadeIn(txt), run_time=0.9)
        fin = boxed(Tex(r"The scale tends to $\lambda_1 = 3$; the error shrinks like $|\lambda_2/\lambda_1|^k = 3^{-k}$ (Example 7.6.1)", font_size=30, color=C3)).to_edge(DOWN, buff=0.25)
        self.play(FadeIn(fin))
        self.wait(2)
